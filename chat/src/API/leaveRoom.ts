export interface ILeaveRoom {
  roomId: string;
  accessToken: string;
}

export const leaveRoom = async ({ roomId, accessToken }:ILeaveRoom) => {
  const response = await fetch(
    `https://matrix-test.maxmodal.com/_matrix/client/v3/rooms/${roomId}/leave`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      "Ошибка при выходе из комнаты: " +
        (errorData.error || response.statusText)
    );
  }

  console.log("Вы успешно покинули комнату");
};
