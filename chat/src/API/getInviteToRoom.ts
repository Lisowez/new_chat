//получить приглашения в комнаты
export interface InviteRooms {
  currentNextBatch: string;
  setInviteRooms: (prevInviteRooms: any) => void;
  accessToken: string;
  setNextBatch: (nextBatch: string) => void;
}

export const getInviteToRoom = async ({
  currentNextBatch,
  setInviteRooms,
  accessToken,
  setNextBatch,
}: InviteRooms) => {
  try {
    const url = currentNextBatch
      ? `https://matrix-test.maxmodal.com/_matrix/client/v3/sync?since=${currentNextBatch}`
      : "https://matrix-test.maxmodal.com/_matrix/client/v3/sync";

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
    console.log("Полученные данные:", data);

    // Обработка текущих приглашений
    const newInviteRooms =
      data.rooms && data.rooms.invite ? Object.keys(data.rooms.invite) : [];

    // Обновляем состояние приглашений
    setInviteRooms((prevInviteRooms) => {
      // Создаем новый Set для уникальных приглашений
      const uniqueInviteRooms = new Set([
        ...prevInviteRooms,
        ...newInviteRooms,
      ]);
      console.log(
        "Обновленный список приглашений:",
        Array.from(uniqueInviteRooms)
      );
      return Array.from(uniqueInviteRooms); // Возвращаем массив уникальных приглашений
    });

    // Обновляем next_batch
    setNextBatch(data.next_batch);
  } catch (error) {
    console.error("Ошибка:", error.message);
  }
};
