import { checkRoomState } from "./checkRoomState";
import { getRooms } from "./getRooms";

export const getAllRoomsStates = async (accessToken) => {
  const rooms = await getRooms({ accessToken });
  const roomsStatesPromises = rooms.joined_rooms.map((roomId) =>
    checkRoomState({ roomId, accessToken })
  );
  const roomsStates = await Promise.all(roomsStatesPromises);

  return roomsStates.filter((state) => state !== null);
};
