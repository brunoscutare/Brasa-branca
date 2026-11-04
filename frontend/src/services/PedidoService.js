const API_URL = "http://localhost:3000/usuarios";

async function lerResposta(response, fallback) {
    const data = await response.json().catch(() => null);

    if (!response.ok) {
        throw new Error(data?.erro || fallback);
    }

    return data;
}

export async function listarPedidos(usuarioId) {
    const response = await fetch(`${API_URL}/${usuarioId}/pedidos`);
    return lerResposta(response, "Erro ao carregar os pedidos.");
}

export async function listarTodosPedidos() {
    const response = await fetch(`${API_URL}/pedidos`);
    return lerResposta(response, "Erro ao carregar os pedidos dos clientes.");
}

export async function listarAvaliacoes() {
    const response = await fetch(`${API_URL}/avaliacoes`);
    return lerResposta(response, "Erro ao carregar as avaliações.");
}

export async function buscarFinanceiro() {
    const response = await fetch(`${API_URL}/financeiro`);
    return lerResposta(response, "Erro ao carregar os dados financeiros.");
}

export async function marcarPedidoRecebido(usuarioId, pedidoId) {
    const response = await fetch(`${API_URL}/${usuarioId}/pedidos/${pedidoId}/status`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: "recebido" })
    });

    return lerResposta(response, "Não foi possível confirmar o recebimento.");
}

export async function avaliarPedido(usuarioId, pedidoId, dados) {
    const response = await fetch(`${API_URL}/${usuarioId}/pedidos/${pedidoId}/avaliacao`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(dados)
    });

    return lerResposta(response, "Não foi possível salvar sua avaliação.");
}

export async function criarPedido(usuarioId, payload) {
    const response = await fetch(`${API_URL}/${usuarioId}/pedidos`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    return lerResposta(response, "Não foi possível finalizar o pedido.");
}
