import { useEffect, useLayoutEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRooms } from "../API/getRooms";
import { createRoom } from "../API/createRoom";
import { getInviteToRoom } from "../API/getInviteToRoom";
import { joinRoom } from "../API/joinRoom";

const Chat = () => {
  const [accessToken, setAccessToken] = useState(
    sessionStorage.getItem("access_token") || ""
  ); //токен
  const [user, setUser] = useState(
    sessionStorage.getItem("user")
      ? sessionStorage.getItem("user").slice(1, -25)
      : "user"
  ); //имя вошедшего   число -25 зависит от имени сервера, по сути это отбрасывает все название кроме имени
  const [rooms, setRooms] = useState([]); //список комнат
  const [roomName, setRoomName] = useState(""); //имя  комнаты при содании
  const [newRoomName, setNewRoomName] = useState(""); // id  созданой комнаты
  const [inviteList, setInviteList] = useState(""); // имя приглашаемого в комнату пользователя
  const [inviteRooms, setInviteRooms] = useState([]); //список приглашений в комнату
  const [nextBatch, setNextBatch] = useState(""); //нужно для обновления состояния

  const navigate = useNavigate();

  useEffect(() => {
    if (!accessToken) navigate("/login");
  }, []);

  useEffect(() => {
    setAccessToken(sessionStorage.getItem("access_token"));
    setUser(
      sessionStorage.getItem("user")
        ? sessionStorage.getItem("user").slice(1, -25)
        : "user"
    );
    getRooms({ accessToken, setRooms, fetchRoomName });
    if (rooms.length > 0) {
      setRooms(
        rooms.map(async (x) => {
          return await fetchRoomName(x);
        })
      );
    }
  }, []);

  useEffect(() => {
    getRooms({ accessToken, setRooms, fetchRoomName });
  }, [newRoomName]);

  useEffect(() => {
    const interval = setInterval(() => {
      getInviteToRoom({
        currentNextBatch: nextBatch,
        setInviteRooms,
        accessToken,
        setNextBatch,
      });
    }, 10000);
    return () => clearInterval(interval);
  }, [nextBatch]);

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
      return data.name;
    } catch (error) {
      console.error(error.message);
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
              <button
                onClick={() => {
                  joinRoom({ roomId: room, accessToken }).then(() => {
                    setInviteRooms((prev) => prev.filter((r) => r !== room));
                  });
                }}
              >
                Присоединиться
              </button>
            </div>
          ))
        ) : (
          <p>Нет приглашений</p>
        )}
      </div>

      <h2>Список всех комнат</h2>
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
        <button
          onClick={() => {
            createRoom({ accessToken, setNewRoomName, roomName, inviteList });
          }}
        >
          создать
        </button>
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
