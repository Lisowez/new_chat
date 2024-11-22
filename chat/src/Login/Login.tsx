import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../API/login";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

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
      <button
        onClick={() => {
          login({ username, password, navigate });
        }}
      >
        Войти
      </button>
    </div>
  );
};

export default Login;
