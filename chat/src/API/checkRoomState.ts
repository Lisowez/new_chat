export interface ICheckRoomState {
  roomId: string;
  accessToken: string;
}

export const checkRoomState = async ({
  roomId,
  accessToken,
}: ICheckRoomState) => {
  try {
    const response = await fetch(
      `https://matrix-test.maxmodal.com/_matrix/client/v3/rooms/${encodeURIComponent(
        roomId
      )}/state`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      const stateEvents = await response.json();
      const name =
        stateEvents.find((x) => x.type === "m.room.name")?.content?.name ||
        "Без названия";
      const isDirect = stateEvents.some(
        (x) =>
          x.type === "m.room.join_rules" && x.content.join_rule === "invite"
      );
      const members = stateEvents
        .filter((x) => x.type == "m.room.member")
        .map((x) => x.sender.slice(1, -25));

      return {
        roomId,
        name,
        isDirect,
        members,
      };
    } else {
      console.error(
        "Ошибка при получении состояния комнаты:",
        response.statusText
      );
      return null;
    }
  } catch (error) {
    console.error("Ошибка запроса:", error);
    return null;
  }
};
