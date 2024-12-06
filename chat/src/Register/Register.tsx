import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../API/register";
import style from "./Register.module.css";
import { checkUserName } from "../API/checkUserName";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [checkPassword, setCheckPassword] = useState("");
  const [isTrueName, setIsTrueName] = useState(true);
  const [isTruePassword, setIsTruePassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [checkPasswordError, setCheckPasswordError] = useState("");
  const [accessToken, setAccessToken] = useState(
    sessionStorage.getItem("access_token") || ""
  );

  useEffect(() => {
    setAccessToken(sessionStorage.getItem("access_token"));
    if (accessToken) navigate("/chat");
  }, []);

  const navigate = useNavigate();

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{7,}$/;

  useEffect(() => {
    if (checkPassword !== password) {
      setCheckPasswordError("Пароли не совпадают");
    } else {
      setCheckPasswordError("");
      setIsTruePassword(true);
    }
  }, [checkPassword]);

  useEffect(() => {
    if (!isTrueName) {
      setLoginError("Имя пользователя занято");
    } else {
      setLoginError("");
    }
  }, [isTrueName]);

  return (
    <div className={style.container}>
      <h1 className={style.title}>Регистрация</h1>
      <form className={style.form}>
        <div className={style.inputBlock}>
          <input
            type='text'
            value={username}
            onBlur={() => {
              checkUserName(username, setIsTrueName);
            }}
            onChange={(e) => {
              const value = e.target.value;
              setUsername(value);
              if (value.length < 1) {
                setLoginError("Необходимо ввести имя пользователя");
              } else {
                setLoginError("");
              }
            }}
            placeholder='Имя пользователя'
            className={style.input}
          />
          {loginError && <div className={style.error}>{loginError}</div>}
        </div>
        <div className={style.inputBlock}>
          <input
            type='password'
            value={password}
            onChange={(e) => {
              const value = e.target.value;
              setPassword(value);
              if (value.length < 1) {
                setPasswordError("Необходимо ввести пароль");
              } else {
                setPasswordError("");
              }
              if (!passwordRegex.test(value)) {
                setPasswordError(
                  "Пароль должен содержать не менее 7 символов, включая хотя бы одну заглавную букву и одну цифру"
                );
              } else {
                setPasswordError("");
              }
            }}
            placeholder='Пароль'
            className={style.input}
          />
          {passwordError && <div className={style.error}>{passwordError}</div>}
        </div>
        <div className={style.inputBlock}>
          {" "}
          <input
            type='password'
            value={checkPassword}
            onChange={(e) => {
              setCheckPassword(e.target.value);
            }}
            placeholder='Повторите пароль'
            className={style.input}
          />
          {checkPasswordError && (
            <div className={style.error}>{checkPasswordError}</div>
          )}
        </div>
        <button
          className={style.button}
          disabled={
            !!loginError ||
            !!passwordError ||
            !!checkPasswordError ||
            !isTrueName ||
            !password||
            !checkPassword
          }
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
