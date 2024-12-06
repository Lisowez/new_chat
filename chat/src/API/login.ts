export interface LoginProps {
  username: string;
  password: string;
  navigate: (path: string) => void;
}

export const login = async ({ username, password, navigate }: LoginProps) => {
  try {
    const response = await fetch(
      "https://matrix-test.maxmodal.com/_matrix/client/v3/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: {
            type: "m.id.user",
            user: username,
          },
          password: password,
          type: "m.login.password",
        }),
      }
    );

    const data = await response.json();
    if (response.ok) {
      sessionStorage.setItem("access_token", data.access_token);
      sessionStorage.setItem("user", data.user_id);
      navigate("/chatik");
    } else if (!response.ok && data.errcode === "M_LIMIT_EXCEEDED") {
      alert(
        "Слишком много запросов" +
          `повторите через ${Math.floor(data.retry_after_ms / 1000)}секунд`
      );
    } else {
      alert("Неверный логин или пароль");
    }
  } catch (error) {
    console.error("Ошибка аутентификации:", error);
  }
};
