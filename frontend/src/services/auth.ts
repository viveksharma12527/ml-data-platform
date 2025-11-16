import { type User } from "@shared/schema";

export const login = async (credentials: Pick<User, "email" | "password">) => {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  if (!response.ok) {
    throw new Error("Login failed");
  }
  return response.json();
};

export const register = async (userData: Omit<User, "id">) => {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    throw new Error("Registration failed");
  }
  return response.json();
};

export const logout = async () => {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error("Logout failed");
  }
  return response.json();
};

export const getCurrentUser = async () => {
  const response = await fetch("/api/auth/me");
  if (!response.ok) {
    throw new Error("Failed to fetch user");
  }
  return response.json();
};