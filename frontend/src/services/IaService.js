const API_URL = "http://localhost:3000/ia";

export async function perguntarCardapio(pergunta) {
    const response = await fetch(`${API_URL}/cardapio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pergunta })
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) throw new Error(data?.erro || "Não foi possível consultar a assistente.");
    return data;
}
