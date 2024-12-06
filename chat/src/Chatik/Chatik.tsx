import { useEffect, useState } from "react";
import style from "./Chatik.module.css";
import { useNavigate } from "react-router-dom";
import { createRoom } from "../API/createRoom";
import { createDialog } from "../API/createDialogs";
import { getAllRoomsStates } from "../API/getAllRoomsState";
import { fetchMessages } from "../API/fetchMessages";
import { getInviteToRoom } from "../API/getInviteToRoom";
import { fetchRoomMembers } from "../API/getAllMemberInRoom";
import { handleSendMessage } from "../API/sendMessage";
import { logout } from "../API/logout";
import { leaveRoom } from "../API/leaveRoom";
import { deleteMessage } from "../API/deleteMessage";
import { getUnreadNotifications } from "../API/notification";

interface ICreator {
  sender: string;
  origin_server_ts: string;
}

export const Chatik = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(
    sessionStorage.getItem("user")
      ? sessionStorage.getItem("user").slice(1, -25)
      : "user"
  );
  const [accessToken, setAccessToken] = useState(
    sessionStorage.getItem("access_token") || ""
  );
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addUser, setAddUser] = useState("");
  const [addRoomName, setAddRoomName] = useState("");
  const [allRooms, setAllRooms] = useState([]);
  const [dialogs, setDialogs] = useState([]);
  const [members, setMembers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [creator, setCreator] = useState<null | ICreator>(null);
  const [chatName, setChatName] = useState("");
  const [idActiveRoom, setIdActiveRoom] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [userBlocks, setUserBlocks] = useState([]);
  const [showOnlineStatus, setShowOnlineStatus] = useState(false);
  const [showUsersBlock, setShowUsersBlock] = useState(false);

  useEffect(() => {
    setAccessToken(sessionStorage.getItem("access_token"));
    if (!accessToken) navigate("/login");
  }, []);

  useEffect(() => {
    if (!showAddDialog && !showAddRoom) {
      setAddRoomName("");
      setAddUser("");
      setUserBlocks([]);
    }
  }, [showAddDialog, showAddRoom]);

  useEffect(() => {
    getAllRoomsStates(accessToken).then((roomsStates) => {
      const rooms = roomsStates.filter((state) => state.isDirect === false);
      setAllRooms(rooms);
      const dialogs = roomsStates.filter((state) => state.isDirect === true);
      setDialogs(dialogs);
    });
    const interval = setInterval(() => {
      getAllRoomsStates(accessToken).then((roomsStates) => {
        const rooms = roomsStates.filter((state) => state.isDirect === false);
        setAllRooms(rooms);
        const dialogs = roomsStates.filter((state) => state.isDirect === true);
        setDialogs(dialogs);
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (idActiveRoom) {
        fetchMessages({
          accessToken,
          id: idActiveRoom,
          setMessages,
          setCreator,
        });
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [idActiveRoom]);

  useEffect(() => {
    const interval = setInterval(() => {
      getInviteToRoom({
        accessToken,
        setOnlineUsers,
      }).finally(() => setShowOnlineStatus(true));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={style.container}>
      <div className={style.top}>
        <h1>Добро пожаловать, {user} !</h1>
        <button
          className={style.leaveButton}
          onClick={() => {
            logout(accessToken);
          }}
        >
          Выйти
        </button>
      </div>
      <div className={style.main}>
        <div className={style.allRooms}>
          <div className={style.dialogsBlock}>
            <h2 className={style.title}>
              Диалоги{" "}
              <button
                className={style.showMore}
                onClick={() => {
                  setShowAddDialog(!showAddDialog);
                  setShowAddRoom(false);
                }}
              >
                {showAddDialog ? "-" : "+"}
              </button>
            </h2>
            <div className={style.dialogs}>
              {dialogs.map((dialog) => (
                <div className={style.room} key={dialog.id}>
                  <div
                    className={style.roomName}
                    onClick={() => {
                      setShowUsersBlock(false);
                      setIdActiveRoom(dialog.roomId);
                      fetchMessages({
                        accessToken,
                        id: dialog.roomId,
                        setMessages,
                        setCreator,
                      });
                      setChatName(dialog.name);
                      fetchRoomMembers({
                        accessToken,
                        id: dialog.roomId,
                        setMembers,
                      });
                    }}
                  >
                    {dialog.members.filter((x) => x !== user)[0] || dialog.name}
                    {showOnlineStatus && (
                      <span>
                        {onlineUsers.includes(
                          dialog.members.filter((x) => x !== user)[0]
                        )
                          ? "🟢"
                          : "🔴"}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() =>
                      leaveRoom({ accessToken, roomId: dialog.roomId })
                    }
                  >
                    Выйти из диалога
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className={style.roomsBlock}>
            <h2 className={style.title}>
              Комнаты
              <button
                className={style.showMore}
                onClick={() => {
                  setShowAddRoom(!showAddRoom);
                  setShowAddDialog(false);
                }}
              >
                {showAddRoom ? "-" : "+"}
              </button>
            </h2>
            <div className={style.rooms}>
              {allRooms.map((room) => (
                <div className={style.room} key={room.id}>
                  <div
                    className={style.roomName}
                    onClick={() => {
                      setShowUsersBlock(true);
                      setIdActiveRoom(room.roomId);
                      fetchMessages({
                        accessToken,
                        id: room.roomId,
                        setMessages,
                        setCreator,
                      });
                      setChatName(room.name);
                      fetchRoomMembers({
                        accessToken,
                        id: room.roomId,
                        setMembers,
                      });
                      getUnreadNotifications({
                        accessToken,
                        roomId: room.roomId,
                      });
                    }}
                  >
                    {room.name}
                  </div>
                  <button
                    onClick={() =>
                      leaveRoom({ accessToken, roomId: room.roomId })
                    }
                  >
                    Выйти из комнаты
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className={style.chatBlock}>
          <h2 className={style.nameChat}>{chatName}</h2>
          <div className={style.chat}>
            <div className={style.messages}>
              {creator && (
                <h3>
                  Комната была создана: {creator.sender.slice(1, -25)}{" "}
                  {new Date(creator.origin_server_ts).toLocaleString()}
                </h3>
              )}
              {messages.map((mes) => (
                <div
                  className={style.message}
                  style={{
                    position: "relative",
                    right: mes.sender.slice(1, -25) !== user && "0%",
                    left: mes.sender.slice(1, -25) === user && "50%",
                  }}
                  key={mes.event_id}
                >
                  {mes.sender.slice(1, -25) !== user && (
                    <div>Отправитель: {mes.sender.slice(1, -25)}</div>
                  )}
                  {mes.sender.slice(1, -25) === user && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      Вы:{" "}
                      <div
                        style={{ cursor: "pointer", color: "red" }}
                        onClick={() => {
                          // deleteMessage({});
                        }}
                      >
                        удалить
                      </div>
                    </div>
                  )}
                  <div
                    style={{
                      borderBottom: "1px solid black",
                      paddingBottom: "5px",
                    }}
                  >
                    Отправлено:{" "}
                    {new Date(mes.origin_server_ts).toLocaleString()}
                  </div>
                  {mes.content.body}
                </div>
              ))}
            </div>
            <div className={style.inputBlock}>
              <input
                onChange={(e) => setMessage(e.target.value)}
                className={style.input}
                type='text'
                value={message}
              />
              <button
                onClick={() => {
                  handleSendMessage({
                    accessToken: accessToken,
                    id: idActiveRoom,
                    message,
                    setMessage,
                  })
                    .then(() =>
                      fetchMessages({
                        accessToken,
                        id: idActiveRoom,
                        setMessages,
                        setCreator,
                      })
                    )
                    .finally(() => {
                      setMessage("");
                    });
                }}
                className={style.button}
              >
                Отправить
              </button>
            </div>
          </div>
        </div>
        {showUsersBlock && (
          <div className={style.users}>
            <h2 className={style.title}>Пользователи</h2>
            {members.map((member) => (
              <div>
                {member.slice(1, -25)}
                {showOnlineStatus && (
                  <span>
                    {onlineUsers.includes(member.slice(1, -25)) ? "🟢" : "🔴"}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {(showAddDialog || showAddRoom) && (
        <div className={style.modal}>
          <form className={style.form}>
            <input
              className={style.input}
              placeholder='название комнаты'
              onChange={(e) => setAddRoomName(e.target.value)}
              value={addRoomName}
            />
            {showAddDialog && (
              <input
                className={style.input}
                type='text'
                placeholder='id того, кого нужно добавить'
                value={addUser}
                onChange={(e) => setAddUser(e.target.value)}
              />
            )}
            {showAddRoom && (
              <>
                <div className={style.addUserBlock}>
                  {userBlocks.map((x) => (
                    <div>{x}</div>
                  ))}
                </div>
                <div
                  style={{
                    width: "80%",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <input
                    className={style.input}
                    type='text'
                    placeholder='id того, кого нужно добавить'
                    value={addUser}
                    onChange={(e) => setAddUser(e.target.value)}
                  />
                  <button
                    style={{ width: "50px", height: "50px", cursor: "pointer" }}
                    onClick={(e) => {
                      e.preventDefault();
                      setUserBlocks((prev) => [...prev, addUser]);
                      setAddUser("");
                    }}
                  >
                    +
                  </button>
                </div>
              </>
            )}
            <button
              className={style.addButton}
              onClick={(e) => {
                e.preventDefault();
                if (showAddDialog) {
                  createDialog({
                    accessToken,
                    roomName: addRoomName,
                    inviteList: addUser,
                  }).finally(() => setShowAddDialog(false));
                }
                if (showAddRoom) {
                  createRoom({
                    accessToken,
                    roomName: addRoomName,
                    inviteList: userBlocks,
                  }).finally(() => setShowAddRoom(false));
                }
              }}
            >
              создать
            </button>
          </form>
        </div>
      )}
    </div>
  );
};