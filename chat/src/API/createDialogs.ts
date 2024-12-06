//функция для создания Диалога
export interface CreateRoomProps {
  accessToken: string;
  roomName: string;
  inviteList: string;
}

export const createDialog = async ({ accessToken, roomName, inviteList }) => {
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
          preset: "private_chat",
          is_direct: true,
          invite:
            inviteList && inviteList.length > 0
              ? inviteList
                  .split(",")
                  .map((x) => `@${x.trim()}:matrix-test.maxmodal.com`)
              : undefined,
        }),
      }
    );
    const data = await response.json();
    if (response.ok) {
      console.log(data.room_id);
      alert("Диалог успешно создан:");
    } else {
      console.log(data.error);
      alert("Ошибка при создании диалога: " + data.error);
    }
  } catch (error) {
    console.log(error);
  }
};
