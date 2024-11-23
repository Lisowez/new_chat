export const logout = async (accessToken: string) => {
  try {
    const response = await fetch(
      "https://matrix-test.maxmodal.com/_matrix/client/v3/logout",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Ошибка при выполнении логаута");
    }

    // Удаляем токены и другую информацию
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("refresh_token");
    sessionStorage.removeItem("user");

    // Перенаправление пользователя на страницу логина
    window.location.href = "/login"; // Замените на нужный вам URL
  } catch (error) {
    console.error("Logout Error:", error);
    // Вы можете уведомить пользователя об ошибке
  }
};
