import API from "../api/axios";

export const loginUser = async (data) => {
  try {
    const res = await API.post("/auth/login", data);
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || err.message || "Login failed");
  }
};

export const registerUser = async (data) => {
  try {
    const res = await API.post("/auth/register", data);
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || err.message || "Registration failed");
  }
};

export const forgotPassword = async (email) => {
  try {
    const res = await API.post("/auth/forgotpassword", { email });
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || err.message || "Failed to send reset email");
  }
};

export const resetPassword = async (token, password) => {
  try {
    const res = await API.put(`/auth/resetpassword/${token}`, { password });
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || err.message || "Failed to reset password");
  }
};
