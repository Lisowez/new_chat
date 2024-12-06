export const checkUserName = async (
  username: string,
  setIsTrueName: (value: boolean) => void
) => {
  const MATRIX_SERVER_URL = "https://matrix-test.maxmodal.com"; // Замените на адрес вашего Matrix-сервера
  const endpoint = `/_matrix/client/v3/register/available?username=${encodeURIComponent(
    username
  )}`;

  try {
    const response = await fetch(`${MATRIX_SERVER_URL}${endpoint}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json", // Укажите заголовок, если требуется
      },
    });

    if (response.ok) {
      const data = await response.json();
      setIsTrueName(data.available);
      return data.available;
    } else {
      setIsTrueName(false);
      return false;
    }
  } catch (error) {
    console.error("Ошибка запроса:", error);
  }
};
