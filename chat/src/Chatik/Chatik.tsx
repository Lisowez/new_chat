import { useEffect, useRef, useState } from "react";
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
import { withOutBatch } from "../API/withOutBatch";
import { withBatch } from "../API/withBatch";
import img from "../addUser.png";
import { inviteUserToRoom } from "../API/inviteToRoom";

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
  const [batch, setBatch] = useState(null);
  const [notification, setNotification] = useState([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [addNewUser, setAddNewUser] = useState("");
  const [uniqueDialogs, setUniqueDialogs] = useState([]);
  const [uniqueRooms, setUniqueRooms] = useState([]);
  const [leaveRooms, setLeaveRooms] = useState([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [isLoadingDialogs, setIsLoadingDialogs] = useState(false);
  const [paginationMessages, setPaginationMessages] = useState(20);
  const [newMessageNotification, setNewMessageNotification] = useState(null);
  const [showNewMessageNotification, setShowNewMessageNotification] =
    useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current.scrollTo({
      top: ref.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    withBatch(
      accessToken,
      batch,
      setBatch,
      setNotification,
      setAccessToken,
      setOnlineUsers,
      onlineUsers,
      setAllRooms,
      setDialogs,
      allRooms,
      dialogs,
      setLeaveRooms,
      setIsLoadingRooms,
      setIsLoadingDialogs,
      user,
      setNewMessageNotification,
      setShowNewMessageNotification
    ).finally(() => setShowOnlineStatus(true));
  }, [accessToken]);

  useEffect(() => {
    setAccessToken(sessionStorage.getItem("access_token"));
    if (!accessToken) navigate("/login");
  }, [accessToken]);

  useEffect(() => {
    if (!showAddDialog && !showAddRoom) {
      setAddRoomName("");
      setAddUser("");
      setUserBlocks([]);
    }
  }, [showAddDialog, showAddRoom]);

  function findNotifications(idRoom) {
    const oneNotification = notification.find((x) => x.id === idRoom);
    const notificationNumber = oneNotification?.count;
    if (notificationNumber) {
      return notificationNumber;
    } else {
      return "";
    }
  }

  useEffect(() => {
    setIsLoadingDialogs(true);
    const timer = setTimeout(() => {
      const uniqueItemsMap = new Map();
      dialogs.forEach((item) => {
        if (!uniqueItemsMap.has(item.roomId)) {
          uniqueItemsMap.set(item.roomId, item);
        }
      });
      const uniqueItems = Array.from(uniqueItemsMap.values()).filter(
        (item) => !leaveRooms.includes(item.roomId)
      );
      setUniqueDialogs(uniqueItems);
      setIsLoadingDialogs(false);
    }, 1000);
    return () => {
      clearTimeout(timer);
    };
  }, [dialogs, leaveRooms]);

  useEffect(() => {
    setIsLoadingRooms(true);
    const timer = setTimeout(() => {
      const uniqueItemsMap = new Map();
      allRooms.forEach((item) => {
        if (!uniqueItemsMap.has(item.roomId)) {
          uniqueItemsMap.set(item.roomId, item);
        }
      });
      const uniqueItems = Array.from(uniqueItemsMap.values()).filter(
        (item) => !leaveRooms.includes(item.roomId)
      );
      setUniqueRooms(uniqueItems);
      setIsLoadingRooms(false);
    }, 1000);
    return () => {
      clearTimeout(timer);
    };
  }, [allRooms, leaveRooms]);

  const setZeroNotification = (roomId: string) => {
    setNotification((prevNotifications) => {
      const updatedNotifications = [...prevNotifications];
      notification.forEach((newNotification) => {
        const existingNotificationIndex = updatedNotifications.findIndex(
          (n) => n.id === roomId
        );
        if (existingNotificationIndex > -1) {
          updatedNotifications[existingNotificationIndex].count = 0;
        }
      });
      console.log(updatedNotifications);
      return updatedNotifications;
    });
  };

  const previousCountRef = useRef();

  useEffect(() => {
    if (idActiveRoom) {
      const oneNotification = notification.find((x) => x.id === idActiveRoom);

      if (oneNotification) {
        const previousCount = previousCountRef.current;
        if (previousCount !== oneNotification.count) {
          fetchMessages({
            accessToken,
            id: idActiveRoom,
            setMessages,
            setCreator,
          });
        }

        previousCountRef.current = oneNotification.count;
      }
    }
  }, [notification, accessToken]);

  useEffect(() => {
    if (idActiveRoom) {
      setPaginationMessages(20);
      fetchMessages({
        accessToken,
        id: idActiveRoom,
        setMessages,
        setCreator,
      });
    }
  }, [idActiveRoom, accessToken]);

  const getNameDialog = () => {
    const dialog = dialogs.find((dialog) => dialog.roomId === idActiveRoom);
    return dialog?.members?.find((member) => member !== user);
  };

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
              {isLoadingDialogs && <div>Загрузка...</div>}
              {!isLoadingDialogs &&
                uniqueDialogs.map((dialog) => (
                  <div className={style.room} key={dialog.id}>
                    <div
                      className={style.roomName}
                      onClick={() => {
                        setShowUsersBlock(false);
                        setIdActiveRoom(dialog.roomId);
                        // fetchMessages({
                        //   accessToken,
                        //   id: dialog.roomId,
                        //   setMessages,
                        //   setCreator,
                        // });
                        setChatName(dialog.name);
                        fetchRoomMembers({
                          accessToken,
                          id: dialog.roomId,
                          setMembers,
                        });
                        setZeroNotification(dialog.roomId);
                      }}
                    >
                      {dialog.members.filter((x) => x !== user)[0] ||
                        dialog.name}
                      {showOnlineStatus && (
                        <span>
                          {onlineUsers.includes(
                            dialog.members.filter((x) => x !== user)[0] ||
                              dialog.name
                          )
                            ? "🟢"
                            : "🔴"}
                        </span>
                      )}
                      {notification.length > 0 && (
                        <span style={{ color: "red", marginLeft: "10px" }}>
                          {findNotifications(dialog.roomId)}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        leaveRoom({ accessToken, roomId: dialog.roomId }).then(
                          () => {
                            setUniqueDialogs((prevDialogs) =>
                              prevDialogs.filter(
                                (x) => x.roomId !== dialog.roomId
                              )
                            );
                            setChatName("");
                            setIdActiveRoom("");
                            setMessages([]);
                          }
                        );
                      }}
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
              {isLoadingRooms && <div>Загрузка...</div>}
              {!isLoadingRooms &&
                uniqueRooms.map((room) => (
                  <div className={style.room} key={room.id}>
                    <div
                      className={style.roomName}
                      onClick={() => {
                        setIdActiveRoom(room.roomId);
                        // fetchMessages({
                        //   accessToken,
                        //   id: room.roomId,
                        //   setMessages,
                        //   setCreator,
                        // });
                        setShowUsersBlock(true);
                        setChatName(room.name);
                        fetchRoomMembers({
                          accessToken,
                          id: room.roomId,
                          setMembers,
                        });

                        setZeroNotification(room.roomId);
                      }}
                    >
                      {room.name}
                    </div>
                    {notification.length > 0 && (
                      <span style={{ color: "red", marginLeft: "5px" }}>
                        {findNotifications(room.roomId)}
                      </span>
                    )}
                    <button
                      onClick={() =>
                        leaveRoom({ accessToken, roomId: room.roomId }).then(
                          () => {
                            setUniqueRooms((prevRooms) =>
                              prevRooms.filter((x) => x.roomId !== room.roomId)
                            );
                            setShowUsersBlock(false);
                            setChatName("");
                            setIdActiveRoom("");
                            setMessages([]);
                          }
                        )
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
          <h2 className={style.nameChat}>
            {showUsersBlock && idActiveRoom
              ? `Вы в комнате: ${chatName}`
              : !showUsersBlock && idActiveRoom
              ? `Диалог с ${
                  getNameDialog() ||
                  dialogs.find((x) => x.roomId === idActiveRoom).name
                } `
              : ""}
          </h2>
          <div className={style.chat}>
            <div className={style.messages} ref={ref}>
              {creator && idActiveRoom && (
                <h3>
                  Комната была создана: {creator.sender.slice(1, -25)}{" "}
                  {new Date(creator.origin_server_ts).toLocaleString()}
                </h3>
              )}
              {messages.length > paginationMessages && (
                <div
                  className={style.loadMore}
                  onClick={() => setPaginationMessages((prev) => prev + 20)}
                >
                  загрузить еще сообщения:{" "}
                  {paginationMessages + 20 > messages.length
                    ? messages.length
                    : paginationMessages + 20}{" "}
                  из
                  {messages.length}
                </div>
              )}
              {(messages.length > paginationMessages
                ? messages.slice(-paginationMessages)
                : messages
              ).map((mes) => (
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
                      {mes.content.body && (
                        <div
                          style={{ cursor: "pointer", color: "red" }}
                          onClick={() => {
                            deleteMessage({
                              roomId: idActiveRoom,
                              eventId: mes.event_id,
                              accessToken,
                            }).then(() => {
                              fetchMessages({
                                accessToken,
                                id: idActiveRoom,
                                setMessages,
                                setCreator,
                              });
                            });
                          }}
                        >
                          удалить
                        </div>
                      )}
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
                  {mes.content.body || (
                    <span style={{ color: "gray" }}>сообщение удалено</span>
                  )}
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
                disabled={message.length === 0}
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
            {members
              .filter((x) => x.slice(1, -25) !== user)
              .map((member) => (
                <div>
                  {member.slice(1, -25)}
                  {showOnlineStatus && (
                    <span>
                      {onlineUsers.includes(member.slice(1, -25)) ? "🟢" : "🔴"}
                    </span>
                  )}
                </div>
              ))}
            <div className={style.addUser}>
              <img
                onClick={() => setShowAddUser(true)}
                className={style.img}
                src={img}
                alt='addUser'
              />
            </div>
            {showAddUser && (
              <form>
                <input
                  onChange={(e) => setAddNewUser(e.target.value)}
                  value={addNewUser}
                  type='text'
                />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    inviteUserToRoom({
                      accessToken,
                      id: idActiveRoom,
                      invite: addNewUser,
                    })
                      .then(() => {
                        setShowAddUser(false);
                        setAddNewUser("");
                      })
                      .catch(console.error);
                  }}
                >
                  Добавить
                </button>
              </form>
            )}
          </div>
        )}
      </div>
      {(showAddDialog || showAddRoom) && (
        <div className={style.modal}>
          <form className={style.form}>
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
                <input
                  className={style.input}
                  placeholder='название комнаты'
                  onChange={(e) => setAddRoomName(e.target.value)}
                  value={addRoomName}
                />
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
                    roomName: addUser,
                    inviteList: addUser,
                    setDialogs,
                  }).finally(() => setShowAddDialog(false));
                }
                if (showAddRoom) {
                  createRoom({
                    accessToken,
                    roomName: addRoomName,
                    inviteList: userBlocks,
                    setAllRooms,
                  }).finally(() => setShowAddRoom(false));
                }
              }}
            >
              создать
            </button>
          </form>
        </div>
      )}
      {newMessageNotification && (
        <div className={style.messageNotification}>
          <div className={style.messageSender}>
            <div>
              {" "}
              Отпрвитель: <b>{newMessageNotification.sender}</b>
            </div>
            <div
              className={style.closeNotification}
              onClick={() => {
                setShowNewMessageNotification(false);
                setNewMessageNotification(null);
              }}
            >
              <b>X</b>
            </div>
          </div>
          <div className={style.messageText}>
            Текст: <b>{newMessageNotification.text}</b>
          </div>
        </div>
      )}
    </div>
  );
};
