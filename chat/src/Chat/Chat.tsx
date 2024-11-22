import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRooms } from "../API/getRooms";
import { createRoom } from "../API/createRoom";
import { getInviteToRoom } from "../API/getInviteToRoom";
import { joinRoom } from "../API/joinRoom";
import style from "./Chat.module.css";

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
  }, [newRoomName,inviteList]);

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
    <div className={style.container}>
      <h1 className={style.title}>Привет {user}</h1>
      <div className={style.roomsAndInvite}>
        <div className={style.invites}>
          <h2 className={style.inviteTitle}>Список приглашений</h2>
          {inviteRooms.length > 0 ? (
            inviteRooms.map((room) => (
              <div key={room} id={room} className={style.invite}>
                <span className={style.inviteName}>{room}</span>
                <button
                  className={style.inviteButton}
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

        <div className={style.rooms}>
          <h2 className={style.roomsTitle}>Список всех комнат</h2>
          {rooms && rooms.length > 0
            ? rooms.map((room) => (
                <div key={room.id} id={room.id} className={style.room}>
                  <span>{room.name}</span>
                  <button
                    className={style.roomButton}
                    onClick={() => navigate(`/chat/${room.id}`)}
                  >
                    Войти в комнату
                  </button>
                </div>
              ))
            : "Нет комнат"}
        </div>
      </div>

      {/* создание комнаты */}
      <div className={style.createRoom}>
        <h2 className={style.createRoomTitle}>создать комнату</h2>
        <form className={style.form}>
          <input
            className={style.input}
            type='text'
            placeholder='id того, кого нужно добавить'
            onChange={(e) => setInviteList(e.target.value)}
          />
          <input
            className={style.input}
            placeholder='название комнаты'
            onChange={(e) => setRoomName(e.target.value)}
          />
          <button
            className={style.button}
            onClick={(e) => {
              e.preventDefault();
              createRoom({ accessToken, setNewRoomName, roomName, inviteList });
            }}
          >
            создать
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
