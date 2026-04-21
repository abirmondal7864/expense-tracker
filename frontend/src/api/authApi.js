import API from "./axios";

export const loginUser = async (data) => {
  return await API.post("/auth/login", data);
};

export const registerUser = async (data) => {
  return await API.post("/auth/register", data);
};

export const forgotPassword = async (email) => {
  return await API.post("/auth/forgotpassword", { email });
};

export const resetPassword = async (token, password) => {
  return await API.put(`/auth/resetpassword/${token}`, { password });
};

export const getUserProfile = async () => {
  return await API.get("/auth/profile");
};
