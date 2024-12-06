import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const RedirectPage = () => {
  const [access_token, setAccess_token] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    setAccess_token(sessionStorage.getItem("access_token"));
    if (access_token) {
      navigate("/chatik");
    } else {
      navigate("/login");
    }
  }, []);
  return <div></div>;
};

export default RedirectPage;
