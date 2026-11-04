const API_URL = "http://localhost:3000/usuarios";

async function lerResposta(response, fallback) {
    const data = await response.json().catch(() => null);

    if (!response.ok) {
        throw new Error(data?.erro || fallback);
    }

    return data;
}

export async function listarCartoes(usuarioId) {
    const response = await fetch(`${API_URL}/${usuarioId}/cartoes`);
    return lerResposta(response, "Erro ao carregar os cartões.");
}

export async function salvarCartao(usuarioId, cartao) {
    const response = await fetch(`${API_URL}/${usuarioId}/cartoes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cartao)
    });

    return lerResposta(response, "Não foi possível salvar o cartão.");
}

export async function atualizarCartao(usuarioId, cartaoId, cartao) {
    const response = await fetch(`${API_URL}/${usuarioId}/cartoes/${cartaoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cartao)
    });

    return lerResposta(response, "Não foi possível atualizar o cartão.");
}

export async function removerCartao(usuarioId, cartaoId) {
    const response = await fetch(`${API_URL}/${usuarioId}/cartoes/${cartaoId}`, {
        method: "DELETE"
    });

    return lerResposta(response, "Não foi possível remover o cartão.");
}
