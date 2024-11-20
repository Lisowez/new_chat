import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const navigate = useNavigate();

  const login = async () => {
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
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("user", data.identifier.user);
        setLoginError(""); // Очистить сообщение об ошибке
        navigate("/chat");
        console.log("Успешно аутентифицирован!", data);
      } else {
        throw new Error(data.error || "Ошибка аутентификации");
      }
    } catch (error) {
      setLoginError(error.message);
      console.error("Ошибка аутентификации:", error);
    }
  };

  return (
    <div className='container'>
      <h2>Авторизация</h2>
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
      <button onClick={login}>Войти</button>
      {loginError && <div style={{ color: "red" }}>{loginError}</div>}{" "}
      {/* Сообщение об ошибке для авторизации */}
    </div>
  );
};

export default Login;
