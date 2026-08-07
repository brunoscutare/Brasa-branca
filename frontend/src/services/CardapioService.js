const API_URL = "http://localhost:3000/produtos-api";
const CARDAPIO_URL = "http://localhost:3000/cardapio";
export const BACKEND_URL = "http://localhost:3000";

export function produtoExibeNoCardapio(produto) {
    if (produto?.exibir_no_cardapio === undefined || produto?.exibir_no_cardapio === null) {
        return true;
    }

    return produto.exibir_no_cardapio === true || produto.exibir_no_cardapio === 1;
}

export async function listarCardapio() {
    const response = await fetch(CARDAPIO_URL);

    if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.erro || "Erro ao carregar cardápio.");
    }

    return response.json();
}

export async function listarProdutos() {
    const response = await fetch(API_URL);

    if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.erro || "Erro ao carregar produtos.");
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

export async function buscarProduto(id) {
    const response = await fetch(`${API_URL}/${id}`);

    if (response.ok) {
        return response.json();
    }

    if (response.status === 404) {
        const produtos = await listarProdutos();
        const produto = produtos.find((item) => String(item.id) === String(id));

        if (produto) {
            return produto;
        }
    }

    const data = await response.json().catch(() => null);
    throw new Error(data?.erro || "Erro ao carregar produto.");
}

export async function atualizarItemCardapio(id, payload) {
    const formData = payload instanceof FormData ? payload : new FormData();

    if (!(payload instanceof FormData)) {
        Object.entries(payload).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                formData.append(key, value);
            }
        });
    }

    const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        body: formData
    });

    if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.erro || "Erro ao atualizar produto.");
    }

    return response.json();
}

export async function atualizarExibicaoCardapio(id, exibirNoCardapio) {
    const response = await fetch(`${API_URL}/${id}/cardapio`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ exibir_no_cardapio: exibirNoCardapio })
    });

    if (!response.ok) {
        const data = await response.json().catch(() => null);
        const fallback = data?.erro || `Erro ${response.status} ao atualizar visibilidade no cardápio.`;
        throw new Error(fallback);
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
