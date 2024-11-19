import React from "react";
import Chat from "./Chat/Chat";
import router from "./APP/Router";
import { RouterProvider } from "react-router-dom";

function App() {
  return (
    <div className='App'>
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
