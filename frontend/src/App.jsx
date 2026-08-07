import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { lazy, Suspense } from "react";
import { useAuth } from "./contexts/AuthContext";
import TopBar from "./components/design/Topbar";

const HomePage = lazy(() => import('./pages/HomePage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const ProdutosPage = lazy(() => import('./pages/ProdutosPage'))
const AddProdutos = lazy(() => import('./components/Produtos/AddProdutos'))

export default function App() {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <Suspense fallback={<h2>Carregando...</h2>}>
      {location.pathname !== "/login" ? <TopBar /> : null}
      <Routes>
        <Route path="/" element={<Navigate to="/homepage" replace />} />
        <Route path="/homepage" element={<HomePage />} />
        <Route path="/cardapio" element={<Navigate to="/homepage" replace />} />
        <Route path="/produtos" element={<ProdutosPage />} />
        <Route path="/produtos/add" element={<AddProdutos />} />
        <Route path="/produtos/edit/:id" element={<AddProdutos />} />
        <Route
          path="/login"
          element={user ? <Navigate to="/homepage" replace /> : <LoginPage />}
        />

      </Routes>
    </Suspense>
  );
}