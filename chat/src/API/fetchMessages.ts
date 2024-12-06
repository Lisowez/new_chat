import { markAllMessagesAsRead } from "./markAllMessagesAsRead";

//информация о сообщениях и создателе чата
export interface IMessagesProps {
  accessToken: string;
  id: string;
  setMessages: (messages: []) => void;
  setCreator: (creator: {}) => void;
}

export const fetchMessages = async ({
  accessToken,
  id,
  setMessages,
  setCreator,
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
    const messages = data.chunk.filter((x) => x.type === "m.room.message");
    const creator = data.chunk.filter((x) => x.type === "m.room.create")[0];
    setMessages(messages);
    setCreator(creator);
    const finishEvent = data.chunk[data.chunk.length - 1].event_id
    markAllMessagesAsRead({roomId:id,eventId:finishEvent, accessToken})
  } catch (error) {
    console.error(error.message);
  }
};
