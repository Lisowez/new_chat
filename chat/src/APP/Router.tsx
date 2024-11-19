import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Register from "../Register/Register";
import Chat from "../Chat/Chat";
import Login from "../Login/Login";
import RedirectPage from "./RedirectPage";

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
]);

export default router;
