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
      navigate("/chat");
    } else {
      throw new Error(data.error || "Ошибка аутентификации");
    }
  } catch (error) {
    console.error("Ошибка аутентификации:", error);
  }
};
