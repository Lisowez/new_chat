import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const OneChat = () => {
  const id = useParams().id;
  const [accessToken, setAccessToken] = useState(
    sessionStorage.getItem("access_token")
  );
  const [myId, setMyId] = useState(sessionStorage.getItem("user"));
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [creator, setCreator] = useState("");
  const [invite, setInvite] = useState("");
  const [userList, setUserList] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    setAccessToken(sessionStorage.getItem("access_token"));
    setMyId(sessionStorage.getItem("user"));
  }, []);

  useEffect(() => {
    if (accessToken) {
      fetchMessages();
      fetchRoomMembers();
    }
  }, [id, message]);

  //информация о чате
  const fetchMessages = async () => {
    try {
      const response = await fetch(
        `https://matrix-test.maxmodal.com/_matrix/client/v3/rooms/${id}/messages?dir=f&limit=100`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Ошибка при получении сообщений: " + response.status);
      }

      const data = await response.json();
      setMessages(data.chunk.filter((x) => x.type === "m.room.message"));
      console.log(
        data.chunk.filter((x) => x.type === "m.room.message").map((x) => x.sender===myId)
      );
      setCreator(
        data.chunk.filter((x) => x.type === "m.room.create")[0].sender
      );
    } catch (error) {
      console.error(error.message);
    }
  };

  //отправка сообщений
  const handleSendMessage = async (e) => {
    // e.preventDefault(); // предотвращаем перезагрузку страницы

    try {
      const response = await fetch(
        `https://matrix-test.maxmodal.com/_matrix/client/v3/rooms/${id}/send/m.room.message`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json", // устанавливаем тип содержимого на JSON
          },
          body: JSON.stringify({
            msgtype: "m.text", // тип сообщения
            body: message, // само сообщение
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Ошибка при отправке сообщения: " + response.status);
      } else {
        console.log("сообщение отправлено");
      }

      setMessage(""); // очищаем сообщение после отправки
    } catch (error) {
      console.error(error.message);
    }
  };

  //приглашение в комнату
  const inviteUserToRoom = async () => {
    try {
      const response = await fetch(
        `https://matrix-test.maxmodal.com/_matrix/client/v3/rooms/${id}/invite`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_id: invite }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Ошибка при приглашении пользователя: " + response.status
        );
      }

      const data = await response.json();
      console.log("Пользователь успешно приглашен:", data);
    } catch (error) {
      console.error("Ошибка:", error.message);
    }
  };

  //список всех пользователей
  const fetchRoomMembers = async () => {
    try {
      const response = await fetch(
        `https://matrix-test.maxmodal.com/_matrix/client/v3/rooms/${id}/members`,
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
          "Ошибка при получении участников комнаты: " + response.status
        );
      }

      const data = await response.json();
      console.log(new Set(data.chunk.map((x) => x.user_id)));
      setUserList(Array.from(new Set(data.chunk.map((x) => x.user_id))));
      return data.chunk; // Возвращаем массив участников
    } catch (error) {
      console.error("Ошибка:", error.message);
    }
  };

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
      <button onClick={handleSendMessage}>Отправить</button>
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
          <button onClick={inviteUserToRoom}>пригласить</button>
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
