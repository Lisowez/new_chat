import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Register from "../Register/Register";
import Login from "../Login/Login";
import RedirectPage from "./RedirectPage";
import { Chatik } from "../Chatik/Chatik";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RedirectPage />,
  },
  {
    path: "login",
    element: <Login />,
  },
  {
    path: "register",
    element: <Register />,
  },
  {
    path: "chatik",
    element: <Chatik />,
  },
]);

export default router;
