//войти в приглашенные комнаты
export interface IJoinRoom {
  roomId: string | any;
  accessToken: string;
}

export const joinRoom = async ({ roomId, accessToken }: IJoinRoom) => {
  try {
    const response = await fetch(
      `https://matrix-test.maxmodal.com/_matrix/client/v3/rooms/${roomId}/join`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      alert("Ошибка при присоединении к комнате: " + response.status);
    }

    const data = await response.json();
   alert("Вы присоединились к комнате");
  } catch (error) {
    console.error("Ошибка:", error.message);
  }
};
