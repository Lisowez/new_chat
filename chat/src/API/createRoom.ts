import { checkRoomState } from "./checkRoomState";

//функция для создания комнаты
export interface CreateRoomProps {
  accessToken: string;
  roomName: string;
  inviteList: string;
  setAllRooms: () => void;
}

export const createRoom = async ({
  accessToken,
  roomName,
  inviteList,
  setAllRooms,
}) => {
  try {
    const response = await fetch(
      "https://matrix-test.maxmodal.com/_matrix/client/v3/createRoom",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          creation_content: {
            "m.federate": false,
          },
          name: roomName,
          preset: "public_chat",
          is_direct: false,
          invite:
            inviteList && inviteList.length > 0
              ? inviteList.map((x) => `@${x.trim()}:matrix-test.maxmodal.com`)
              : undefined,
        }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      const state = await checkRoomState({ roomId: data.room_id, accessToken });
      setAllRooms((prev) => [...prev, state]);
      alert("Комната успешно создана:");
    } else {
      const data = await response.json();
      alert("Ошибка при создании комнаты: " + data.error);
    }
  } catch (error) {
    console.log(error);
  }
};
