export const logout = (): void => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  window.location.href = "/login";
};
