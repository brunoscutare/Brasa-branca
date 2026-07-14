import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import TopBar from "./components/design/Topbar";

const HomePage = lazy(() => import('./pages/HomePage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login"/>;
  }
  return children;
}

export default function App() {
  const { user } = useAuth();


  return (
    <Suspense fallback={<h2>Carregando...</h2>}>
      {user ? <TopBar /> : null}
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route
          path="/homepage"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/login"
          element={
            !user
              ? <LoginPage />
              : <Navigate to="/homepage" />
          }
        />
      </Routes>
    </Suspense>
  );
}