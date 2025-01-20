import { joinRoom } from "./joinRoom";
import { refreshAccessToken } from "./refresh";

export const withBatch = async (
  accessToken: string,
  since: string,
  setBatch,
  setNotification,
  setAccessToken,
  setOnlineUsers,
  onlineUsers,
  setAllRooms,
  setDialogs,
  allRooms,
  dialogs,
  setLeaveRooms,
  setIsLoadingRooms,
  setIsLoadingDialogs
) => {
  let url;
  since
    ? (url = `https://matrix-test.maxmodal.com/_matrix/client/v3/sync?timeout=30000&since=${since}`)
    : (url =
        "https://matrix-test.maxmodal.com/_matrix/client/v3/sync?timeout=30000");

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    // Проверка на успешность ответа
    if (!response.ok) {
      throw new Error(
        `Ошибка при синхронизации: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    if (data.rooms && data.rooms.join) {
      const arr = Object.keys(data.rooms.join);
      const arr1 = arr.map((x) => {
        return {
          id: x,
          count:
            data.rooms.join[x].unread_notifications?.notification_count || 0, // Защита от ошибок при отсутствии данных
        };
      });

      setNotification((prevNotifications) => {
        // Создаем копию предыдущих уведомлений
        const updatedNotifications = [...prevNotifications];

        // Обновляем или добавляем уведомления
        arr1.forEach((newNotification) => {
          const existingNotificationIndex = updatedNotifications.findIndex(
            (n) => n.id === newNotification.id
          );

          if (existingNotificationIndex > -1) {
            // Если уведомление уже существует, обновляем count
            updatedNotifications[existingNotificationIndex].count =
              newNotification.count;
          } else {
            // Если уведомления нет, добавляем новое
            updatedNotifications.push(newNotification);
          }
        });

        return updatedNotifications; // Возвращаем обновленный массив уведомлений
      });
    }
    // Верните значение next_batch для дальнейшего использования
    if (data.next_batch === since) {
      setBatch(null);
    } else {
      setBatch(data.next_batch);
    }
    if (since && data.rooms && data.rooms.leave) {
      const id = Object.keys(data.rooms.leave)[0];
      setLeaveRooms((prevRooms) => {
        return [...prevRooms, id];
      });
    }
    if (data.presence) {
      const newOnlineUsers = data.presence.events
        .filter((x) => x.content.presence === "online")
        .map((x) => {
          return x.sender.slice(1, -25);
        });
      const newOfflineUsers = data.presence.events
        .filter((x) => x.content.presence === "offline")
        .map((x) => {
          return x.sender.slice(1, -25);
        });
      const allStatusUsers = Array.from(
        new Set([...onlineUsers, ...newOnlineUsers])
      ).filter((x) => !newOfflineUsers.includes(x));

      setOnlineUsers(allStatusUsers);
    }

    if (data.rooms && data.rooms.invite) {
      const invite = Object.keys(data.rooms.invite);
      invite.map((x) => joinRoom({ roomId: x, accessToken }));
    }

    withBatch(
      accessToken,
      data.next_batch,
      setBatch,
      setNotification,
      setAccessToken,
      setOnlineUsers,
      onlineUsers,
      setAllRooms,
      setDialogs,
      allRooms,
      dialogs,
      setLeaveRooms,
      setIsLoadingRooms,
      setIsLoadingDialogs
    );

    if (!since && data.rooms && data.rooms.join) {
      const arr = Object.keys(data.rooms.join);
      arr.map((x) => {
        const name =
          data.rooms.join[x]?.state?.events.find(
            (y) => y.type === "m.room.name"
          )?.content?.name ||
          data.rooms.join[x].timeline.events.find(
            (y) => y.type === "m.room.name"
          )?.content?.name;
        const roomId = x;
        const members = data.rooms.join[x]?.state?.events
          ?.filter(
            (y) =>
              y.type === "m.room.member" && y.content?.membership === "join"
          )
          .map((y) => {
            return y.sender.slice(1, -25);
          })
          .concat(
            data.rooms.join[x].timeline.events
              .filter(
                (y) =>
                  y.type === "m.room.member" && y.content?.membership === "join"
              )
              .map((y) => {
                return y.sender.slice(1, -25);
              })
          );

        const isDirect =
          (data.rooms.join[x]?.timeline?.events?.filter(
            (y) => y.type === "m.room.join_rules"
          ).length
            ? data.rooms.join[x]?.timeline?.events?.filter(
                (y) => y.type === "m.room.join_rules"
              )[0].content.join_rule
            : data.rooms.join[x]?.state?.events?.filter(
                (y) => y.type === "m.room.join_rules"
              )[0]?.content?.join_rule) === "invite";

        const objectInfo = {
          name,
          roomId,
          members,
          isDirect,
        };
        objectInfo.isDirect
          ? setDialogs((prevDialogs) => {
              return [...prevDialogs, objectInfo];
            })
          : setAllRooms((prevRooms) => {
              return [...prevRooms, objectInfo];
            });
      });
    }
    if (since && data.rooms && data.rooms.join) {
      const arr = Object.keys(data.rooms.join);
      arr.map((x) => {
        if (
          data.rooms.join[x].timeline.events.find(
            (y) =>
              y.type === "m.room.create" &&
              data.rooms.join[x].timeline.events.length !== 2
          )
        ) {
          const name = data.rooms.join[x].timeline.events.find(
            (y) => y.type === "m.room.name"
          )?.content?.name;

          const roomId = x;

          const isDirect =
            data.rooms.join[x]?.timeline.events.find(
              (y) => y.type === "m.room.join_rules"
            ).content.join_rule === "invite";
          console.log(data.rooms.join[x].timeline.events);
          const members = data.rooms.join[x].timeline?.events
            .filter(
              (y) =>
                y.type === "m.room.member" && y.content?.membership === "join"
            )
            .map((y) => {
              return y.sender.slice(1, -25);
            });
          const objectInfo = {
            name,
            roomId,
            members,
            isDirect,
          };
          objectInfo.isDirect
            ? setDialogs((prevDialogs) => {
                return [...prevDialogs, objectInfo];
              })
            : setAllRooms((prevRooms) => {
                return [...prevRooms, objectInfo];
              });
        }
      });
    }
  } catch (error) {
    if (error.message.includes("401")) {
      refreshAccessToken(setAccessToken);
    } else {
      console.error("Произошла ошибка:", error);
    }
  }
};
