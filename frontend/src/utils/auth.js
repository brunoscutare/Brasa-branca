export function isAdmin(user) {
    return Boolean(
        user?.superadmin ||
        user?.funcao === "funcionario"
    );
}

export function isCliente(user) {
    return Boolean(user && !isAdmin(user));
}

export function homePathFor(user) {
    if (isAdmin(user)) {
        return "/produtos";
    }

    return "/homepage";
}
