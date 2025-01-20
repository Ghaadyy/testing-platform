import { useEffect, useState } from "react";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router";
import HomeScreen from "./screens/HomeScreen";
import EditorScreen from "./screens/EditorScreen";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DndProvider } from "react-dnd";
import { ThemeProvider } from "./shadcn/components/theme-provider";
import { UserContext } from "./context/UserContext";
import { User } from "./models/User";
import LoginScreen from "./screens/LoginScreen";
import SignUpScreen from "./screens/SignUpScreen";
import { jwtDecode } from "jwt-decode";
import RootLayout from "./layouts/RootLayout";
import RunsScreen from "./screens/RunsScreen";
import ViewRunScreen from "./screens/ViewRunScreen";

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  function authorize(route: JSX.Element): JSX.Element {
    return isAuthenticated && !loading ? (
      route
    ) : (
      <Navigate replace to="/auth/login" />
    );
  }

  function anonymous(route: JSX.Element): JSX.Element {
    return isAuthenticated && !loading ? <Navigate replace to="/" /> : route;
  }

  useEffect(() => {
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
    setLoading(false);
  }, []);

  const router = createBrowserRouter([
    {
      path: "/",
      element: <RootLayout />,
      children: [
        { path: "tests/:testId/runs", element: authorize(<RunsScreen />) },

        { path: "", element: authorize(<HomeScreen />) },
      ],
    },
    {
      path: "/runs/:runId",
      element: authorize(<ViewRunScreen />),
    },
    { path: "/auth/login", element: anonymous(<LoginScreen />) },
    { path: "/auth/signup", element: anonymous(<SignUpScreen />) },
    { path: "/editor/:test", element: authorize(<EditorScreen />) },
  ]);

  return (
    <DndProvider backend={HTML5Backend}>
      <ThemeProvider defaultTheme="dark">
        <UserContext.Provider
          value={{
            user,
            setUser,
            token,
            setToken,
            isAuthenticated,
            setIsAuthenticated,
          }}
        >
          <RouterProvider router={router} />
        </UserContext.Provider>
      </ThemeProvider>
    </DndProvider>
  );
}

export default App;
