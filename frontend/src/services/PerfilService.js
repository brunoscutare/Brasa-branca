const API_URL = "http://localhost:3000/usuarios";

async function lerResposta(response, fallback) {
    const data = await response.json().catch(() => null);
    if (!response.ok) throw new Error(data?.erro || fallback);
    return data;
}

export async function buscarPerfil(usuarioId) {
    const response = await fetch(`${API_URL}/${usuarioId}/perfil`);
    return lerResposta(response, "Erro ao carregar o perfil.");
}

export async function alterarSenha(usuarioId, dados) {
    const response = await fetch(`${API_URL}/${usuarioId}/senha`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados)
    });
    return lerResposta(response, "Não foi possível alterar a senha.");
}

export async function atualizarPerfil(usuarioId, dados) {
    const response = await fetch(`${API_URL}/${usuarioId}/perfil`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados)
    });
    return lerResposta(response, "Não foi possível atualizar o perfil.");
}
