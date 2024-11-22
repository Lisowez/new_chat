import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import style from "./Login.module.css";
import { login } from "../API/login";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [accessToken, setAccessToken] = useState(
    sessionStorage.getItem("access_token") || ""
  );
  const navigate = useNavigate();

  useEffect(() => {
    setAccessToken(sessionStorage.getItem("access_token"));
    if (accessToken) navigate("/chat");
  }, []);

  return (
    <div className={style.container}>
      <h1 className={style.title}>Авторизация</h1>
      <form className={style.form}>
        <input
          type='text'
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder='Имя пользователя'
          className={style.input}
        />
        <input
          type='password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder='Пароль'
          className={style.input}
        />
        <button
          className={style.button}
          onClick={(e) => {
            e.preventDefault();
            login({ username, password, navigate });
          }}
        >
          Войти
        </button>
      </form>
      <div className={style.text}>
        Если у вас нет аккаунта, то{" "}
        <span onClick={() => navigate("/register")} className={style.link}>
          Нажмите сюда для регистрации
        </span>
      </div>
    </div>
  );
};

export default Login;
