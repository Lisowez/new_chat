//список всех пользователей в комнате
export interface IGetAllMember {
  accessToken: string;
  id: string;
  setUserList: ([]) => void;
}
export const fetchRoomMembers = async ({
  accessToken,
  id,
  setUserList,
}: IGetAllMember) => {
  try {
    const response = await fetch(
      `https://matrix-test.maxmodal.com/_matrix/client/v3/rooms/${id}/joined_members`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        "Ошибка при получении участников комнаты: " + response.status
      );
    }

    const data = await response.json();
    setUserList(Object.keys(data.joined));
    return data.chunk; // Возвращаем массив участников
  } catch (error) {
    console.error("Ошибка:", error.message);
  }
};
