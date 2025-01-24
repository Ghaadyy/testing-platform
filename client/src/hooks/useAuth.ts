import { UserContext } from "@/context/UserContext";
import { API_URL } from "@/main";
import { TokenResponse } from "@/models/TokenResponse";
import { useContext } from "react";

type User = {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
};

export function useAuth() {
  const { setToken, setIsAuthenticated, setUser } = useContext(UserContext);

  async function signup(
    user: User,
    onFinish: () => void = () => {},
    onError: (err: string) => void = () => {}
  ) {
    const res = await fetch(`${API_URL}/api/users/signup`, {
      method: "POST",
      body: JSON.stringify(user),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const err = await res.text();
      onError(err);
    } else {
      const { token, user }: TokenResponse = await res.json();
      setToken(token);
      setUser(user);
      setIsAuthenticated(true);
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      onFinish();
    }
  }

  async function login(
    email: string,
    password: string,
    onFinish: () => void = () => {},
    onError: (err: string) => void = () => {}
  ) {
    const res = await fetch(`${API_URL}/api/users/login`, {
      method: "POST",
      body: JSON.stringify({ email, password }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const err = await res.text();
      onError(err);
    } else {
      const { token, user }: TokenResponse = await res.json();
      setToken(token);
      setUser(user);
      setIsAuthenticated(true);
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      onFinish();
    }
  }

  function logout(onFinish: () => void = () => {}) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setToken(null);
    setUser(null);
    onFinish();
  }

  return { login, logout, signup };
}
