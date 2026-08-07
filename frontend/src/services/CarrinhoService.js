const API_URL = "http://localhost:3000/usuarios";

export async function buscarCarrinho(usuarioId) {
    const response = await fetch(`${API_URL}/${usuarioId}/carrinho`);

    if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.erro || "Erro ao carregar o carrinho.");
    }

    return response.json();
}

export async function salvarCarrinho(usuarioId, items) {
    const response = await fetch(`${API_URL}/${usuarioId}/carrinho`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ items })
    });

    if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.erro || "Erro ao salvar o carrinho.");
    }

    return response.json();
}
