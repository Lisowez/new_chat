interface IProps {
  roomId: string;
  eventId: string;
  accessToken: string;
}

export async function markAllMessagesAsRead({
  roomId,
  eventId,
  accessToken,
}: IProps) {
  const url = `https://matrix-test.maxmodal.com/_matrix/client/v3/rooms/${encodeURIComponent(
    roomId
  )}/read_markers`;

  const body = JSON.stringify({
    "m.fully_read": eventId,
    "m.read": eventId,
  });

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: body,
    });

    if (!response.ok) {
      throw new Error(`Error marking messages as read: ${response.statusText}`);
    }

    console.log(
      `Все сообщения в комнате "${roomId}" помечены как прочитанные.`
    );
  } catch (error) {
    console.error(
      "Ошибка при попытке пометить сообщения как прочитанные:",
      error
    );
  }
}
