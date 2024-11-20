import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const OneChat = () => {
  const id = useParams().id;
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("access_token")
  );
  const [myId, setMyId] = useState(localStorage.getItem("user"));
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    setAccessToken(localStorage.getItem("access_token"));
    setMyId(localStorage.getItem("user"));
  }, []);

  useEffect(() => {
    if (accessToken) fetchMessages();
  }, [id, message]);

  //информация о чате
  const fetchMessages = async () => {
    try {
      const response = await fetch(
        `https://matrix-test.maxmodal.com/_matrix/client/v3/rooms/${id}/messages?dir=b&limit=100`,
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
      console.log(data.chunk.filter((x) => x.type === "m.room.message"));
      setMessages(data.chunk.filter((x) => x.type === "m.room.message")); // храним полученные сообщения в состоянии
      return data.chunk.filter((x) => x.type === "m.room.message");
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

  return (
    <div style={{ position: "relative" }}>
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
      {/* <button onClick={fetchMessages}>Проверка</button> */}
      <h1>сообщения</h1>
      {messages.map((mes) => (
        <div
          style={{
            position: "relative",
            right: mes.sender_id === myId ? "0%" : "-80%",
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
