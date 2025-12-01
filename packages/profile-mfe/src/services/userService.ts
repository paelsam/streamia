import api from "./api";
import { TokenManager } from "@streamia/shared/utils";
import { Profile } from "../types/profile.types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// LOGIN
export const loginUser = async (email: string, password: string) => {
  const res = await api.post("/users/login", { email, password });

  if (res.data.token) {
    TokenManager.setToken(res.data.token);
  }

  return res.data;
};

// REGISTER
export const registerUser = async (data: {
  firstName: string;
  lastName: string;
  age: number;
  email: string;
  password: string;
  confirmPassword: string;
}) => {
  const res = await api.post("/users/register", data);
  return res.data;
};

// GET PROFILE
export const getUserProfile = async (): Promise<Profile> => {
  const res = await api.get("/users/me");
  return res.data.user;
};

// UPDATE PROFILE
export const updateUserProfile = async (data: Partial<Profile>) => {
  const res = await api.put("/users/me", data);
  return res.data.user;
};

// CHANGE PASSWORD
export const changePassword = async (oldPassword: string, newPassword: string) => {
  const token = TokenManager.getToken();
  if (!token) throw new Error("No token found");

  const response = await fetch(`${API_URL}/users/change-password`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      currentPassword: oldPassword,
      newPassword: newPassword,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to change password");
  }

  return response.json();
};

// DELETE ACCOUNT
export const deleteAccount = async (password: string) => {
  const token = TokenManager.getToken();
  if (!token) throw new Error("No token provided");

  const response = await fetch(`${API_URL}/users/me`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete account");
  }

  // Backend returns 204 → NO CONTENT
  return true; // delete account successful
};

// LOGOUT
export const logoutUser = () => {
  TokenManager.removeToken();
};
