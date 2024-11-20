import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Register from "../Register/Register";
import Chat from "../Chat/Chat";
import Login from "../Login/Login";
import RedirectPage from "./RedirectPage";
import OneChat from "../OneChat/OneChat";

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
    path: "chat",
    element: <Chat />,
  },
  {
    path: "chat/:id",
    element: <OneChat />,
  },
]);

export default router;
