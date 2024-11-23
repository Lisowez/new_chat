//функция для создания комнаты
export interface CreateRoomProps {
  accessToken: string;
  setNewRoomName: (roomName: string) => void;
  roomName: string;
  inviteList: string;
}

export const createRoom = async ({
  accessToken,
  setNewRoomName,
  roomName,
  inviteList,
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
          invite:
            inviteList && inviteList.length > 0
              ? inviteList.split(",").map((x) => x.trim())
              : undefined,
        }),
      }
    );
    const data = await response.json();
    if (response.ok) {
      setNewRoomName(data.room_id);
      alert("Комната успешно создана:");
    } else {
      alert("Ошибка при создании комнаты: " + data.error);
    }
  } catch (error) {
    console.log(error);
  }
};
