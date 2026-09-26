import { User } from "../types";

export async function signInWithApple(): Promise<User | null> {
  try {
    // Apple Sign In実装
    const response = await fetch("/api/auth/apple", {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });
    return response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function signInWithGoogle(): Promise<User | null> {
  try {
    const response = await fetch("/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });
    return response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function signOut(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST" });
}

export function saveAuthToken(token: string) {
  localStorage.setItem("kaito.auth", token);
}

export function getAuthToken(): string | null {
  return localStorage.getItem("kaito.auth");
}
