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
const CadastroPage = lazy(() => import("./pages/CadastroPage"));
const ProdutosPage = lazy(() => import("./pages/ProdutosPage"));
const AddProdutos = lazy(() => import("./components/Produtos/AddProdutos"));
const CarrinhoPage = lazy(() => import("./pages/CarrinhoPage"));
const PedidosPage = lazy(() => import("./pages/PedidosPage"));
const PagamentosPage = lazy(() => import("./pages/PagamentosPage"));
const PerfilPage = lazy(() => import("./pages/PerfilPage"));
const ConfiguracoesPage = lazy(() => import("./pages/ConfiguracoesPage"));
const ClientesPage = lazy(() => import("./pages/ClientesPage"));
const AvaliacoesPage = lazy(() => import("./pages/AvaliacoesPage"));
const FinanceiroPage = lazy(() => import("./pages/FinanceiroPage"));
const FuncionariosPage = lazy(() => import("./pages/FuncionariosPage"));

export default function App() {
    const { user } = useAuth();
    const location = useLocation();

    return (
        <Suspense fallback={<h2>Carregando...</h2>}>
            {location.pathname !== "/login" && location.pathname !== "/cadastro" ? <TopBar /> : null}
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
                    path="/cadastro"
                    element={
                        user ? (
                            <Navigate to={homePathFor(user)} replace />
                        ) : (
                            <PublicOnlyRoute>
                                <CadastroPage />
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
                            <PagamentosPage />
                        </ClientRoute>
                    }
                />
                <Route
                    path="/pedidos"
                    element={
                        <AuthRoute>
                            <PedidosPage />
                        </AuthRoute>
                    }
                />
                <Route
                    path="/perfil"
                    element={
                        <AuthRoute>
                            <PerfilPage />
                        </AuthRoute>
                    }
                />
                <Route
                    path="/configuracoes"
                    element={
                        <AuthRoute>
                            <ConfiguracoesPage />
                        </AuthRoute>
                    }
                />

                <Route
                    path="/clientes"
                    element={
                        <AdminRoute>
                            <ClientesPage />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/avaliacoes"
                    element={
                        <AdminRoute>
                            <AvaliacoesPage />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/financeiro"
                    element={
                        <AdminRoute>
                            <FinanceiroPage />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/funcionarios"
                    element={
                        <AdminRoute>
                            <FuncionariosPage />
                        </AdminRoute>
                    }
                />

                <Route path="*" element={<Navigate to="/homepage" replace />} />
            </Routes>
        </Suspense>
    );
}
