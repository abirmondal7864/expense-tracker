import { toast, type Id } from "react-toastify";

export const successToast = (msg: string): Id => {
  return toast.success(msg);
};

export const errorToast = (msg: string): Id => {
  return toast.error(msg);
};
