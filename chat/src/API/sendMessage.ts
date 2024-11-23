//отправка сообщений
export interface ISendMessage {
  accessToken: string;
  message: string;
  setMessage: (message: string) => void;
  id: string;
}

export const handleSendMessage = async ({
  accessToken,
  message,
  setMessage,
  id,
}: ISendMessage) => {
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
      setMessage(""); // очищаем сообщение после отправки
    }
  } catch (error) {
    console.error(error.message);
  }
};
