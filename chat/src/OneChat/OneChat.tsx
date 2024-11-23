import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchMessages } from "../API/fetchMessages";
import { handleSendMessage } from "../API/sendMessage";
import { inviteUserToRoom } from "../API/inviteToRoom";
import { fetchRoomMembers } from "../API/getAllMemberInRoom";
import style from "./OneChat.module.css";
import { deleteMessage } from "../API/deleteMessage";

const OneChat = () => {
  const id = useParams().id;
  const [accessToken, setAccessToken] = useState(
    sessionStorage.getItem("access_token") || ""
  );
  const [myId, setMyId] = useState(sessionStorage.getItem("user") || "");
  const [nameRoom, setNameRoom] = useState("");
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [creator, setCreator] = useState("");
  const [invite, setInvite] = useState("");
  const [userList, setUserList] = useState([]);

  const ref = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (!accessToken) navigate("/login");
    fetchRoomName(id);
  }, []);

  useEffect(() => {
    setAccessToken(sessionStorage.getItem("access_token"));
    setMyId(sessionStorage.getItem("user"));
    if (accessToken) {
      fetchMessages({ id, myId, setCreator, setMessages, accessToken });
      fetchRoomMembers({ accessToken, id, setUserList });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (accessToken && myId) {
        fetchMessages({ id, myId, setCreator, setMessages, accessToken });
        fetchRoomMembers({ accessToken, id, setUserList });
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [accessToken, id, myId]);

  const scrollToBottom = () => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  };

  async function fetchRoomName(id) {
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
      setNameRoom(data.name);
      return data.name;
    } catch (error) {
      console.error(error.message);
    }
  }

  return (
    <div style={{ position: "relative" }} className={style.container}>
      <div className={style.top}>
        <h1 className={style.title}>Вы находитесь в комнате: {nameRoom}</h1>
        {myId === creator && (
          <form className={style.invite}>
            <input
              type='text'
              placeholder='пригласить пользователя'
              onChange={(e) => setInvite(e.target.value)}
              value={invite}
              className={style.input}
            />
            <button
              className={style.button}
              onClick={(e) => {
                e.preventDefault();
                inviteUserToRoom({ accessToken, invite, id });
              }}
            >
              пригласить
            </button>
          </form>
        )}
        <div className={style.back}>
          <button
            className={style.backButton}
            onClick={() => navigate("/chat")}
          >
            Вернуться в основное меню
          </button>
        </div>
      </div>
      <div className={style.chat}>
        <div className={style.userList}>
          <h2 className={style.titleUserList}>Пользователи в комнате</h2>
          {userList.map((x) => (
            <h4 key={x} className={style.user}>
              {x}
            </h4>
          ))}
        </div>
        <div className={style.messageList} ref={ref}>
          <h2 className={style.titleMessage}>Чат</h2>
          {messages.map((mes) => (
            <div
              className={style.message}
              style={{
                position: "relative",
                right: mes.sender !== myId && "0%",
                left: mes.sender === myId && "50%",
              }}
              key={mes.event_id}
            >
              {mes.sender !== myId && <div>Отправитель: {mes.sender}</div>}
              {mes.sender === myId && (
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  Вы:{" "}
                  <div
                    style={{ cursor: "pointer", color: "red" }}
                    onClick={() => {
                      console.log(mes.event_id);
                      deleteMessage({
                        roomId: id,
                        eventId: mes.event_id,
                        accessToken,
                      });
                    }}
                  >
                    удалить
                  </div>
                </div>
              )}
              <div
                style={{
                  borderBottom: "1px solid black",
                  paddingBottom: "5px",
                }}
              >
                Отправлено: {new Date(mes.origin_server_ts).toLocaleString()}
              </div>
              {mes.content.body}
            </div>
          ))}
        </div>
        <form className={style.form}>
          {" "}
          <textarea
            className={style.sendInput}
            placeholder='отправить сообщение'
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button
          disabled={!message}
            className={style.sendButton}
            onClick={(e) => {
              e.preventDefault();
              handleSendMessage({
                accessToken,
                message,
                setMessage,
                id,
              }).then(() => {
                fetchMessages({
                  id,
                  myId,
                  setCreator,
                  setMessages,
                  accessToken,
                }).then(() => {
                  setTimeout(() => {
                    scrollToBottom();
                  }, 500);
                });
              });
            }}
          >
            Отправить
          </button>
        </form>
      </div>
    </div>
  );
};

export default OneChat;
