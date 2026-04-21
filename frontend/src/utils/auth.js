export const logout = () => {
  localStorage.removeItem("user"); // Currently the app uses "user" in localStorage containing {token: ...} or "token" ?
  localStorage.removeItem("token"); // just to be safe based on the prompt
  window.location.href = "/login";
};
