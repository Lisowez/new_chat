import { joinRoom } from "./joinRoom";
import { refreshAccessToken } from "./refresh";

export const withOutBatch = async (
  accessToken: string,
  setBatch,
  setNotification,
  setAccessToken,
  setOnlineUsers
) => {
  const url =
    "https://matrix-test.maxmodal.com/_matrix/client/v3/sync?timeout=500";

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
    setBatch(data.next_batch);
    if (data.presence) {
      const onlineUsers = data.presence.events.map((x) => {
        return x.sender.slice(1, -25);
      });
      setOnlineUsers(onlineUsers);
    }

    if (data.rooms && data.rooms.invite) {
      const invite = Object.keys(data.rooms.invite);
      invite.map((x) => joinRoom({ roomId: x, accessToken }));
    }
  } catch (error) {
    console.error("Произошла ошибка111:", error);
    refreshAccessToken(setAccessToken);
  }
};
