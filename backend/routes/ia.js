import { Router } from "express";
import db from "../database/connection.js";

const router = Router();

function textoSeguro(valor, limite) {
    return String(valor || "").trim().slice(0, limite);
}

router.post("/cardapio", async (req, res) => {
    const pergunta = textoSeguro(req.body?.pergunta, 600);
    const apiKey = process.env.GEMINI_API_KEY;
    const modelo = process.env.GEMINI_MODEL || "gemini-2.5-flash";

    if (!pergunta) return res.status(400).json({ erro: "Digite uma pergunta." });
    if (!apiKey) return res.status(503).json({ erro: "A assistente ainda não está configurada." });

    try {
        const [produtos] = await db.promise().query(
            `SELECT nome, descricao, sobremesa
             FROM produtos
             WHERE exibir_no_cardapio = 1
             ORDER BY sobremesa ASC, nome ASC`
        );

        const cardapio = produtos.map((produto) => (
            `- ${produto.nome}: ${produto.descricao || "Descrição não informada."}${produto.sobremesa ? " (sobremesa)" : ""}`
        )).join("\n");

        const respostaGemini = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelo)}:generateContent`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-goog-api-key": apiKey
                },
                body: JSON.stringify({
                    systemInstruction: {
                        parts: [{
                            text: "Você é a assistente virtual do restaurante Brasa Branca. Responda em português do Brasil, com simpatia e objetividade. Use somente as informações do cardápio fornecido. Se a informação não estiver na descrição, diga que a equipe pode confirmar os detalhes. Não invente ingredientes, alergênicos, preços ou disponibilidade. Você pode explicar os pratos, comparar opções e sugerir pratos com base no que está descrito."
                        }]
                    },
                    contents: [{
                        parts: [{
                            text: `Cardápio atual:\n${cardapio || "Nenhum item disponível."}\n\nPergunta do cliente:\n${pergunta}`
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.35,
                        maxOutputTokens: 350
                    }
                })
            }
        );

        const dados = await respostaGemini.json().catch(() => null);
        if (!respostaGemini.ok) {
            console.error("Gemini API:", respostaGemini.status, dados?.error?.message || "erro desconhecido");
            return res.status(502).json({ erro: "Não foi possível consultar a assistente agora." });
        }

        const resposta = dados?.candidates?.[0]?.content?.parts
            ?.map((parte) => parte.text || "")
            .join(" ")
            .trim();

        if (!resposta) return res.status(502).json({ erro: "A assistente não retornou uma resposta." });
        return res.status(200).json({ resposta });
    } catch (error) {
        console.error("Assistente do cardápio:", error.message);
        return res.status(502).json({ erro: "Não foi possível consultar a assistente agora." });
    }
});

export default router;
