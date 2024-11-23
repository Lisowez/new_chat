//приглашение в комнату

export interface IinviteToRoom {
  accessToken: string;
  invite: string;
  id: string;
}
export const inviteUserToRoom = async ({
  accessToken,
  invite,
  id,
}: IinviteToRoom) => {
  try {
    const response = await fetch(
      `https://matrix-test.maxmodal.com/_matrix/client/v3/rooms/${id}/invite`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: invite }),
      }
    );

    if (!response.ok) {
      throw new Error(
        "Ошибка при приглашении пользователя: " + response.status
      );
    }

    const data = await response.json();
    console.log("Пользователь успешно приглашен:", data);
  } catch (error) {
    console.error("Ошибка:", error.message);
  }
};