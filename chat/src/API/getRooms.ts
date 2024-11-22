// Функция для получения всех комнат на сервер
export interface Room {
  access_token: string;
  setRooms: (rooms: any) => void;
  fetchRoomName: (roomId: string) => Promise<string>;
}


export const getRooms = async ({ accessToken, setRooms ,fetchRoomName}) => {
  try {
    const response = await fetch(
      "https://matrix-test.maxmodal.com/_matrix/client/v3/joined_rooms",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();
    if (response.ok) {
      const idRooms = data.joined_rooms;
      const roomNames = await Promise.all(
        idRooms.map((id) => fetchRoomName(id))
      );
      const idAndName = roomNames.map((room, index) => {
        return { name: room, id: idRooms[index] };
      });

      setRooms(idAndName);
      return data; // Возвращаем данные с комнатам
    } else {
      throw new Error(data.error || "Ошибка получения комнат");
    }
  } catch (error) {
    console.error("Ошибка при получении комнат:", error);
  }
};
