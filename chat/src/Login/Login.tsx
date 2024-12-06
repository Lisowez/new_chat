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
  // const [loginError, setLoginError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setAccessToken(sessionStorage.getItem("access_token"));
    if (accessToken) navigate("/chat");
  }, []);

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{7,}$/;

  return (
    <div className={style.container}>
      <h1 className={style.title}>Авторизация</h1>
      <form className={style.form}>
        <input
          type='text'
          value={username}
          onChange={(e) => {
            const value = e.target.value;
            setUsername(value);
          }}
          placeholder='Имя пользователя'
          className={style.input}
        />
        <input
          type='password'
          value={password}
          onChange={(e) => {
            const value = e.target.value;
            setPassword(value);
            if (passwordRegex.test(value)) {
              setPasswordError("");
            } else {
              setPasswordError(
                "Пароль должен содержать не менее 7 символов, включая хотя бы одну заглавную букву и цифру."
              );
            }
          }}
          placeholder='Пароль'
          className={style.input}
        />
        <div style={{ color: "red", padding: "5px 20px" }}>{passwordError}</div>
        <button
          disabled={!!passwordError || !username || !password}
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
