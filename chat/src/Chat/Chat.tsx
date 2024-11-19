// src/Chat.js
import React, { useEffect, useState } from "react";

const Chat = () => {
  const [accessToken, setAccessToken] = useState("");
  const [serverStatus, setServerStatus] = useState("");
  const [rooms, setRooms] = useState([]);
  const [roomName, setRoomName] = useState("");
  const [newRoomName, setNewRoomName] = useState("");
  const [activeUsers, setActiveUsers] = useState([]);
  const [checkRoomsName, setCheckRoomsName] = useState("");
  const [inviteList, setInviteList] = useState("");

  useEffect(() => {
    setAccessToken(localStorage.getItem("access_token"));
  }, []);

  // Функция для проверки доступности сервера
  const checkServer = async () => {
    try {
      const response = await fetch(
        "https://matrix-test.maxmodal.com/.well-known/matrix/client",
        {
          // эндпоинт, который можно использовать для проверки сервера
          method: "GET",
        }
      );

      if (response.ok) {
        const data = await response.json();
        setServerStatus("Сервер доступен: " + data["m.homeserver"].base_url);
        console.log(data["m.homeserver"].base_url);
        console.log("Сервер доступен!", data["m.homeserver"].base_url);
      } else {
        throw new Error("Сервер не доступен. Статус: " + response.status);
      }
    } catch (error) {
      setServerStatus(`Ошибка: ${error.message}`);
      console.error("Ошибка проверки сервера:", error);
    }
  };

  // Функция для получения всех комнат на сервере
  const getRooms = async (accessToken) => {
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
        console.log("Комнаты успешно получены:", data);
        setRooms(data.joined_rooms);
        return data; // Возвращаем данные с комнатами
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
            invite: inviteList.split(",").map((x) => x.trim()),
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

  // Функция для получения списка пользователей в комнате
  const getActiveUsers = async () => {
    try {
      const response = await fetch(
        `https://matrix-test.maxmodal.com/_matrix/client/v3/rooms/${checkRoomsName}/joined_members`,
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
        const users = Object.keys(data.joined);
        setActiveUsers((prev) => [...prev, ...users]);
      }
    } catch (error) {
      console.error("Ошибка при получении пользователей:", error);
    }
  };

  return (
    <>
      <h1>Matrix Chat</h1>

      {/* Кнопка для проверки статуса сервера */}
      <div>
        <h2>Проверка состояния сервера</h2>
        <button onClick={checkServer}>Проверить сервер</button>
        {serverStatus && <div>{serverStatus}</div>}{" "}
        {/* Сообщение о состоянии сервера */}
      </div>

      {/* Уведомление об успешном входе */}
      {accessToken && <div>Вы успешно вошли в систему!</div>}

      {/* проверка всех комнат */}
      <h2>Проверка всех комнат</h2>
      <button onClick={() => getRooms(accessToken)}>
        Получить все комнаты
      </button>
      <div>
        {rooms && rooms.length > 0
          ? rooms.map((room) => <div key={room}>{room}</div>)
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

      {/*проверка активных пользователей в комнате*/}
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
      </div>
    </>
  );
};

export default Chat;
