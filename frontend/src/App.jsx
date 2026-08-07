import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { lazy, Suspense } from "react";
import { useAuth } from "./contexts/AuthContext";
import TopBar from "./components/design/Topbar";
import {
    AdminRoute,
    AuthRoute,
    ClientRoute,
    PublicOnlyRoute,
    ShopRoute
} from "./components/routing/RouteGuards";
import { homePathFor } from "./utils/auth";

const HomePage = lazy(() => import("./pages/HomePage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const ProdutosPage = lazy(() => import("./pages/ProdutosPage"));
const AddProdutos = lazy(() => import("./components/Produtos/AddProdutos"));
const CarrinhoPage = lazy(() => import("./pages/CarrinhoPage"));

function AuthHomeRedirect() {
    const { user } = useAuth();
    return <Navigate to={homePathFor(user)} replace />;
}

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

                <Route
                    path="/login"
                    element={
                        user ? (
                            <Navigate to={homePathFor(user)} replace />
                        ) : (
                            <PublicOnlyRoute>
                                <LoginPage />
                            </PublicOnlyRoute>
                        )
                    }
                />

                <Route
                    path="/produtos"
                    element={
                        <AdminRoute>
                            <ProdutosPage />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/produtos/add"
                    element={
                        <AdminRoute>
                            <AddProdutos />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/produtos/edit/:id"
                    element={
                        <AdminRoute>
                            <AddProdutos />
                        </AdminRoute>
                    }
                />

                <Route
                    path="/carrinho"
                    element={
                        <ShopRoute>
                            <CarrinhoPage />
                        </ShopRoute>
                    }
                />

                <Route
                    path="/pagamentos"
                    element={
                        <ClientRoute>
                            <Navigate to="/homepage" replace />
                        </ClientRoute>
                    }
                />
                <Route
                    path="/pedidos"
                    element={
                        <AuthRoute>
                            <AuthHomeRedirect />
                        </AuthRoute>
                    }
                />
                <Route
                    path="/perfil"
                    element={
                        <AuthRoute>
                            <AuthHomeRedirect />
                        </AuthRoute>
                    }
                />
                <Route
                    path="/configuracoes"
                    element={
                        <AuthRoute>
                            <AuthHomeRedirect />
                        </AuthRoute>
                    }
                />

                <Route
                    path="/clientes"
                    element={
                        <AdminRoute>
                            <Navigate to="/produtos" replace />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/avaliacoes"
                    element={
                        <AdminRoute>
                            <Navigate to="/produtos" replace />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/financeiro"
                    element={
                        <AdminRoute>
                            <Navigate to="/produtos" replace />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/funcionarios"
                    element={
                        <AdminRoute>
                            <Navigate to="/produtos" replace />
                        </AdminRoute>
                    }
                />

                <Route path="*" element={<Navigate to="/homepage" replace />} />
            </Routes>
        </Suspense>
    );
}
