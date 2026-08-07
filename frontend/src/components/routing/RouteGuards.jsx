import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { homePathFor, isAdmin, isCliente } from "../../utils/auth";

export function PublicOnlyRoute({ children }) {
    const { user } = useAuth();

    if (user) {
        return <Navigate to={homePathFor(user)} replace />;
    }

    return children;
}

export function ClientRoute({ children }) {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (isAdmin(user)) {
        return <Navigate to="/produtos" replace />;
    }

    if (!isCliente(user)) {
        return <Navigate to="/homepage" replace />;
    }

    return children;
}

export function AdminRoute({ children }) {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/homepage" replace />;
    }

    if (!isAdmin(user)) {
        return <Navigate to="/homepage" replace />;
    }

    return children;
}

export function ShopRoute({ children }) {
    const { user } = useAuth();

    if (isAdmin(user)) {
        return <Navigate to="/produtos" replace />;
    }

    return children;
}

export function AuthRoute({ children }) {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
