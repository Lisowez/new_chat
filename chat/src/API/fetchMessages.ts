//информация о сообщениях и создателе чата
export interface IMessagesProps {
  accessToken: string;
  id: string;
  myId: string;
  setCreator: (creator: string) => void;
  setMessages: (messages: []) => void;
}

export const fetchMessages = async ({
  accessToken,
  id,
  myId,
  setCreator,
  setMessages,
}: IMessagesProps) => {
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
    setCreator(data.chunk.filter((x) => x.type === "m.room.create")[0].sender);
  } catch (error) {
    console.error(error.message);
  }
};
