import { useEffect, useLayoutEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchMessages } from "../API/fetchMessages";
import { handleSendMessage } from "../API/sendMessage";
import { inviteUserToRoom } from "../API/inviteToRoom";
import { fetchRoomMembers } from "../API/getAllMemberInRoom";

const OneChat = () => {
  const id = useParams().id;
  const [accessToken, setAccessToken] = useState(
    sessionStorage.getItem("access_token") || ""
  );
  const [myId, setMyId] = useState(sessionStorage.getItem("user") || "");
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [creator, setCreator] = useState("");
  const [invite, setInvite] = useState("");
  const [userList, setUserList] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    if (!accessToken) navigate("/login");
  }, []);

  useEffect(() => {
    setAccessToken(sessionStorage.getItem("access_token"));
    setMyId(sessionStorage.getItem("user"));
  }, []);

  useEffect(() => {
    if (accessToken) {
      fetchMessages({ id, myId, setCreator, setMessages, accessToken });
      fetchRoomMembers({ accessToken, id, setUserList });
    }
  }, [id, message]);

  return (
    <div style={{ position: "relative" }}>
      <div>
        <h1>Пользователи в комнате</h1>
        {userList.map((x) => (
          <h2>{x}</h2>
        ))}
      </div>
      {id}
      <input
        type='text'
        placeholder='отправить сообщение'
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button
        onClick={() => {
          handleSendMessage({ accessToken, message, setMessage, id });
        }}
      >
        Отправить
      </button>
      <div>
        <button onClick={() => navigate(-1)}>назад</button>
      </div>
      {myId === creator && (
        <div>
          <input
            type='text'
            placeholder='пригласить пользователя'
            onChange={(e) => setInvite(e.target.value)}
          />
          <button
            onClick={() => {
              inviteUserToRoom({ accessToken, invite, id });
            }}
          >
            пригласить
          </button>
        </div>
      )}
      <h1>сообщения</h1>
      {messages.map((mes) => (
        <div
          style={{
            position: "relative",
            right: mes.sender !== myId ? "0%" : "-80%",
          }}
          key={mes.event_id}
        >
          {mes.content.body}
        </div>
      ))}
    </div>
  );
};

export default OneChat;
