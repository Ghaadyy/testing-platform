import { useContext, useEffect } from "react";
import { createBrowserRouter, RouterProvider } from "react-router";
import HomeScreen from "./screens/HomeScreen";
import EditorScreen from "./screens/EditorScreen";
import { UserContext } from "./context/UserContext";
import LoginScreen from "./screens/LoginScreen";
import SignUpScreen from "./screens/SignUpScreen";
import RootLayout from "./layouts/RootLayout";
import RunsScreen from "./screens/RunsScreen";
import ViewRunScreen from "./screens/ViewRunScreen";
import { useAuth } from "./hooks/useAuth";
import { Toaster } from "./shadcn/components/ui/toaster";

function App() {
  const { authInitialized } = useContext(UserContext);
  const { authorize, anonymous, tryLogin } = useAuth();

  useEffect(() => tryLogin(), [tryLogin]);

  const router = createBrowserRouter([
    {
      path: "/",
      element: <RootLayout />,
      children: [
        { path: "", element: authorize(<HomeScreen />) },
        { path: "tests/:testId/runs", element: authorize(<RunsScreen />) },
      ],
    },
    {
      path: "/tests/:testId/runs/:runId",
      element: authorize(<ViewRunScreen />),
    },
    { path: "/auth/login", element: anonymous(<LoginScreen />) },
    { path: "/auth/signup", element: anonymous(<SignUpScreen />) },
    { path: "/editor/:testId", element: authorize(<EditorScreen />) },
  ]);

  return (
    <>
      {authInitialized && <RouterProvider router={router} />}
      <Toaster />
    </>
  );
}

export default App;
