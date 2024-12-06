export async function getUnreadNotifications({
  roomId,
  accessToken,
}: {
  roomId: string;
  accessToken: string;
}) {
  const url = `https://matrix-test.maxmodal.com/_matrix/client/v3/rooms/${encodeURIComponent(
    roomId
  )}/unread_notifications`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Ошибка при получении уведомлений: ${response.statusText}`
      );
    }

    const responseData = await response.json();
    console.log("Непрочитанные уведомления:", responseData);
  } catch (error) {
    console.error("Ошибка при запросе непрочитанных уведомлений:", error);
  }
}
