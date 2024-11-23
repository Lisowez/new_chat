export interface IDeleteMessage {
  roomId: string;
  eventId: string;
  accessToken: string;
}

export const deleteMessage = async ({
  roomId,
  eventId,
  accessToken,
}: IDeleteMessage) => {
  // Генерация уникального идентификатора для транзакции
  const txnId = `txn_${Date.now()}`;

  try {
    const response = await fetch(
      `https://matrix-test.maxmodal.com/_matrix/client/v3/rooms/${roomId}/redact/${eventId}/${txnId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: "Сообщение удалено" }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ошибка при удалении сообщения: ${errorText}`);
    }

    alert("Сообщение успешно удалено");
  } catch (error) {
    console.error("Ошибка:", error);
  }
};
