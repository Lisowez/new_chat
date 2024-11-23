import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../API/register";
import style from "./Register.module.css";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [accessToken, setAccessToken] = useState(
    sessionStorage.getItem("access_token") || ""
  );

  useEffect(() => {
    setAccessToken(sessionStorage.getItem("access_token"));
    if (accessToken) navigate("/chat");
  }, []);

  const navigate = useNavigate();

  return (
    <div className={style.container}>
      <h1 className={style.title}>Регистрация</h1>
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
            register({
              username,
              password,
              navigate,
            });
          }}
        >
          Зарегистрироваться
        </button>
      </form>
      <div className={style.text}>
        Если у вас уже есть аккаунт, то{" "}
        <span onClick={() => navigate("/login")} className={style.link}>
          Нажмите сюда для входа
        </span>
      </div>
    </div>
  );
};

export default Register;
