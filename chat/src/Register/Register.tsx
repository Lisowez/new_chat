import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../API/register";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [registrationMessage, setRegistrationMessage] = useState("");
  const [accessToken, setAccessToken] = useState(
    sessionStorage.getItem("access_token") || ""
  );

  useEffect(() => {
    setAccessToken(sessionStorage.getItem("access_token"));
    if (accessToken) navigate("/chat");
  }, []);

  const navigate = useNavigate();

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
      <button
        onClick={() => {
          register({
            username,
            password,
            setRegistrationMessage,
            navigate,
          });
        }}
      >
        Зарегистрироваться
      </button>
      {registrationMessage && <div>{registrationMessage}</div>}{" "}
      {/* Сообщение о регистрации */}
    </div>
  );
};

export default Register;
