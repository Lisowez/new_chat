import { join } from "path";
import { joinRoom } from "./joinRoom";

//получить приглашения в комнаты
export interface InviteRooms {
  // currentNextBatch: string;
  accessToken: string;
  // setNextBatch: (nextBatch: string) => void;
  setOnlineUsers: (onlineUsers: []) => void;
}

export const getInviteToRoom = async ({
  // currentNextBatch,
  accessToken,
  // setNextBatch,
  setOnlineUsers,
}: InviteRooms) => {
  try {
    const url =
      "https://matrix-test.maxmodal.com/_matrix/client/v3/sync?timeout=30000";

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Ошибка при синхронизации: " + response.status);
    }

    const data = await response.json();

    // Обработка текущих приглашений
    const newInviteRooms =
      data.rooms && data.rooms.invite ? Object.keys(data.rooms.invite) : [];
    const joinToRooms = newInviteRooms.map((x) => {
      joinRoom({
        roomId: x,
        accessToken,
      });
    });

    const joinToRoomsPromises = Promise.all(joinToRooms);
    setOnlineUsers(
      data.presence.events
        .filter((x) => x.content.presence === "online")
        .map((x) => x.sender.slice(1, -25))
    );
    const rooms = Object.keys(data.rooms.join);
    const dataEvents = rooms.map((x) => {
      const eventRead =
        data.rooms.join[x].account_data.events[0].content.event_id;
      if (eventRead) {
        const messages = data.rooms.join[x].timeline.events;
        const finishMessageId = messages[messages.length - 1].event_id;
        console.log(finishMessageId !== eventRead);
      }
    });
  } catch (error) {
    console.error("Ошибка:", error.message);
  }
};
