export async function refreshAccessToken(
  setAccessToken: React.Dispatch<React.SetStateAction<string>>
) {
  const url = "https://matrix-test.maxmodal.com/_matrix/client/v3/refresh";

  const refreshToken = sessionStorage.getItem("refreshToken");
  const clientId = sessionStorage.getItem("user");
  const body = {
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: clientId,
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Error: ${response.statusText}`);
  }

  const data = await response.json();
  sessionStorage.setItem("access_token", data.access_token);
  sessionStorage.setItem("refreshToken", data.refresh_token);
  setAccessToken(data.access_token);
  console.log(data);
  return data;
}
