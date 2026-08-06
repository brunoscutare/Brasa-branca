const API_URL = "http://localhost:3000/produtos-api";

export async function listarCardapio() {
    const response = await fetch(API_URL);

    if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.erro || "Erro ao carregar cardápio.");
    }

    return response.json();
}

export async function criarItemCardapio(payload) {
    const formData = payload instanceof FormData ? payload : new FormData();

    if (!(payload instanceof FormData)) {
        Object.entries(payload).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                formData.append(key, value);
            }
        });
    }

    const response = await fetch(API_URL, {
        method: "POST",
        body: formData
    });

    if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.erro || "Erro ao cadastrar produto.");
    }

    return response.json();
}

export async function excluirItemCardapio(id) {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE"
    });

    if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.erro || "Erro ao excluir produto.");
    }

    return response.json();
}