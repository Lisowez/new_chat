// src/Chat.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Chat = () => {
  const [accessToken, setAccessToken] = useState(
    sessionStorage.getItem("access_token")
  ); //токен
  const [user, setUser] = useState(
    sessionStorage.getItem("user").slice(1, -25) || "user"
  ); //имя вошедшего
  const [rooms, setRooms] = useState([]); //список комнат
  const [roomName, setRoomName] = useState(""); //имя  комнаты при содании
  const [newRoomName, setNewRoomName] = useState(""); // id  созданой комнаты
  // const [activeUsers, setActiveUsers] = useState([]);
  // const [checkRoomsName, setCheckRoomsName] = useState("");
  const [inviteList, setInviteList] = useState(""); // имя приглашаемого в комнату пользователя
  const [idRoom, setIdRoom] = useState(""); // id комнаты для поиска
  const [idRoomName, setIdRoomName] = useState(""); // имя комнаты по ее ID
  const [inviteRooms, setInviteRooms] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    setAccessToken(sessionStorage.getItem("access_token"));
    setUser(sessionStorage.getItem("user").slice(1, -25));
    getRooms();
    if (rooms.length > 0) {
      setRooms(
        rooms.map(async (x) => {
          return await fetchRoomName(x);
        })
      );
    }
  }, []);

  useEffect(() => {
    getRooms();
  }, [newRoomName]);

  useEffect(() => {
    const interval = setInterval(() => {
      getSyncUpdates();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Функция для получения всех комнат на сервер
  const getRooms = async () => {
    try {
      const response = await fetch(
        "https://matrix-test.maxmodal.com/_matrix/client/v3/joined_rooms",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        const idRooms = data.joined_rooms;
        const roomNames = await Promise.all(
          idRooms.map((id) => fetchRoomName(id))
        );
        const idAndName = roomNames.map((room, index) => {
          return { name: room, id: idRooms[index] };
        });

        setRooms(idAndName);
        return data; // Возвращаем данные с комнатам
      } else {
        throw new Error(data.error || "Ошибка получения комнат");
      }
    } catch (error) {
      console.error("Ошибка при получении комнат:", error);
    }
  };

  //функция для создания комнаты

  const createRoom = async () => {
    try {
      const response = await fetch(
        "https://matrix-test.maxmodal.com/_matrix/client/v3/createRoom",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            creation_content: {
              "m.federate": false,
            },
            name: roomName,
            preset: "public_chat",
            invite:
              inviteList && inviteList.length > 0
                ? inviteList.split(",").map((x) => x.trim())
                : undefined,
          }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        setNewRoomName(data.room_id);
        console.log("Комната успешно создана:", data);
      }
    } catch (error) {
      console.error("Ошибка при создании комнаты:", error);
    }
  };

  // // Функция для получения списка пользователей в комнате
  // const getActiveUsers = async () => {
  //   try {
  //     const response = await fetch(
  //       `https://matrix-test.maxmodal.com/_matrix/client/v3/rooms/${checkRoomsName}/joined_members`,
  //       {
  //         method: "GET",
  //         headers: {
  //           Authorization: `Bearer ${accessToken}`,
  //           "Content-Type": "application/json",
  //         },
  //       }
  //     );
  //     const data = await response.json();
  //     if (response.ok) {
  //       const users = Object.keys(data.joined);
  //       setActiveUsers((prev) => [...prev, ...users]);
  //     }
  //   } catch (error) {
  //     console.error("Ошибка при получении пользователей:", error);
  //   }
  // };

  // получение названия комнаты по ID
  const fetchRoomName = async (id) => {
    try {
      const response = await fetch(
        `https://matrix-test.maxmodal.com/_matrix/client/v3/rooms/${id}/state/m.room.name`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "Ошибка при получении названия комнаты: " + response.status
        );
      }

      const data = await response.json();
      setIdRoomName(data.name); // получаем название комнаты из ответа
      return data.name;
    } catch (error) {
      console.error(error.message);
    }
  };

  //получить приглашения в комнаты
  const getSyncUpdates = async () => {
    try {
      const response = await fetch(
        "https://matrix-test.maxmodal.com/_matrix/client/v3/sync",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Ошибка при синхронизации: " + response.status);
      }

      const data = await response.json();
      const idRooms = Object.keys(data.rooms.invite);
      setInviteRooms(idRooms);
    } catch (error) {
      console.error("Ошибка:", error.message);
    }
  };

  //войти в приглашенные комнаты

  const joinRoom = async (roomId) => {
    try {
      const response = await fetch(
        `https://matrix-test.maxmodal.com/_matrix/client/v3/rooms/${roomId}/join`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "Ошибка при присоединении к комнате: " + response.status
        );
      }

      const data = await response.json();
      console.log("Вы присоединились к комнате:", data);
    } catch (error) {
      console.error("Ошибка:", error.message);
    }
  };

  return (
    <>
      <h1>Привет {user}</h1>
      <h1>Matrix Chat</h1>

      <div>
        <h2>Список приглашений</h2>
        {inviteRooms.length > 0 ? (
          inviteRooms.map((room) => (
            <div key={room} id={room}>
              <span>{room}</span>
              <button onClick={() => joinRoom(room)}>Присоединиться</button>
            </div>
          ))
        ) : (
          <p>Нет приглашений</p>
        )}
      </div>

      {/* проверка всех комнат */}
      <h2>Проверка всех комнат</h2>
      <button onClick={() => getRooms()}>Получить все комнаты</button>
      <div>
        {rooms && rooms.length > 0
          ? rooms.map((room) => (
              <div key={room.id} id={room.id}>
                <span>{room.name}</span>
                <button onClick={() => navigate(`/chat/${room.id}`)}>
                  Войти в комнату
                </button>
              </div>
            ))
          : "Нет комнат"}
      </div>

      {/* создание комнаты */}
      <div>
        <h2>создать комнату</h2>
        <input
          type='text'
          placeholder='кого добавить'
          onChange={(e) => setInviteList(e.target.value)}
        />
        <input
          placeholder='название'
          onChange={(e) => setRoomName(e.target.value)}
        />
        <button onClick={createRoom}>создать</button>
        <div>id комнаты - {newRoomName}</div>
      </div>

      {/* проверка активных пользователей в комнате
      <h2>Проверка активных пользователей в комнате</h2>
      <input
        type='text'
        placeholder='id комнаты'
        onChange={(e) => setCheckRoomsName(e.target.value)}
      />
      <button onClick={() => getActiveUsers()}>
        Получить активных пользователей
      </button>
      <div>
        {activeUsers && activeUsers.length > 0
          ? activeUsers.map((user) => <div key={user}>{user}</div>)
          : "Нет активных пользователей"}
      </div> */}
      {/*проверка названия комнаты по ID*/}
      {/* <h2>проверка названия комнаты по ID</h2>
      <input
        type='text'
        placeholder='id комнаты'
        onChange={(e) => setIdRoom(e.target.value)}
      />
      <button onClick={() => fetchRoomName()}>
        Получить активных пользователей
      </button>
      <div>{idRoomName ? idRoomName : "Нет комнаты"}</div> */}
    </>
  );
};

export default Chat;
