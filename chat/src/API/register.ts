export interface RegisterProps {
  username: string;
  password: string;
  navigate: (path: string) => void;
}

export const register = async ({
  username,
  password,
  navigate,
}: RegisterProps) => {
  try {
    // Первый запрос для создания сессии
    const response = await fetch(
      "https://matrix-test.maxmodal.com/_matrix/client/v3/register?kind=user",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      }
    );
    const data = await response.json();
    // Второй запрос с использованием session
    const secondResponse = await fetch(
      "https://matrix-test.maxmodal.com/_matrix/client/v3/register?kind=user",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          auth: {
            session: data.session,
            type: "m.login.dummy",
          },
          refresh_token: true,
          username: username,
          password: password,
        }),
      }
    );
    const secondData = await secondResponse.json();
    if (!secondResponse.ok) {
      throw new Error(secondData.error || "Ошибка регистрации");
    }
    // Успешно зарегистрированы
    sessionStorage.setItem("access_token", secondData.access_token);
    sessionStorage.setItem("refreshToken", secondData.refresh_token);
    sessionStorage.setItem("user", secondData.user_id);
    navigate("/chat");
    // Очистка состояния сессии
  } catch (error) {
    console.error("Ошибка регистрации:", error);
  }
};
