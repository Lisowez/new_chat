import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [registrationMessage, setRegistrationMessage] = useState("");

  const navigate = useNavigate();
  const [session, setSession] = useState("");

  // Функция для регистрации нового пользователя
  const register = async () => {
    try {
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
      if (response) {
        console.log(data.session);
        setSession(data.session);
        if (session) {
          const response = await fetch(
            "https://matrix-test.maxmodal.com/_matrix/client/v3/register?kind=user",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                auth: {
                  session: session,
                  type: "m.login.dummy",
                },
                refresh_token: true,
                username: username,
                password: password,
              }),
            }
          );
          const data = await response.json();
          if (response.ok) {
            setRegistrationMessage("Успешно зарегистрирован!");
            localStorage.setItem("accessToken", data.access_token);
            localStorage.setItem("refreshToken", data.refresh_token);
            navigate("/chat");
            setSession("");
            console.log("Пользователь успешно зарегистрирован!", data);
          } else {
            throw new Error(data.error || "Ошибка регистрации");
          }
        }
      } else {
        throw new Error(data.error || "Ошибка регистрации");
      }
    } catch (error) {
      setRegistrationMessage(`Ошибка регистрации: ${error.message}`);
      console.error("Ошибка регистрации:", error);
    }
  };
  return (
    <div className='container'>
      <h2>Регистрация</h2>
      <input
        type='text'
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder='Имя пользователя'
      />
      <input
        type='password'
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder='Пароль'
      />
      <button onClick={register}>Зарегистрироваться</button>
      {registrationMessage && <div>{registrationMessage}</div>}{" "}
      {/* Сообщение о регистрации */}
    </div>
  );
};

export default Register;
