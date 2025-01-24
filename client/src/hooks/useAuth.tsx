import { UserContext } from "@/context/UserContext";
import { API_URL } from "@/main";
import { TokenResponse } from "@/models/TokenResponse";
import { User } from "@/models/User";
import { jwtDecode } from "jwt-decode";
import { useCallback, useContext } from "react";
import { Navigate } from "react-router";

type UserModel = {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
};

export function useAuth() {
  const {
    setToken,
    setIsAuthenticated,
    setUser,
    isAuthenticated,
    setAuthInitialized,
  } = useContext(UserContext);

  async function signup(
    user: UserModel,
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

  const tryLogin = useCallback(
    function () {
      const token = localStorage.getItem("token");
      const userRaw = localStorage.getItem("user");
      if (token !== null && userRaw !== null) {
        const { exp } = jwtDecode(token);
        if (!exp || exp < Date.now() / 1000) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setToken(null);
          setUser(null);
          setIsAuthenticated(false);
        } else {
          const user: User = JSON.parse(userRaw);
          setToken(token);
          setUser(user);
          setIsAuthenticated(true);
        }
      }
      setAuthInitialized(true);
    },
    [setAuthInitialized, setIsAuthenticated, setToken, setUser]
  );

  function authorize(route: JSX.Element): JSX.Element {
    return isAuthenticated ? route : <Navigate replace to="/auth/login" />;
  }

  function anonymous(route: JSX.Element): JSX.Element {
    return isAuthenticated ? <Navigate replace to="/" /> : route;
  }

  return { login, logout, signup, tryLogin, authorize, anonymous };
}
