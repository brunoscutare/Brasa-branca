import { Router } from "express";
import db from "../database/connection.js";
import {
    cartaoPublico,
    criptografarDadosCartao,
    descriptografarDadosCartao
} from "../security/cardData.js";

const router = Router();

function obterUsuarioId(parametro) {
    const id = Number(parametro);
    return Number.isInteger(id) && id > 0 ? id : null;
}

function validarDadosCartao(body) {
    const numero = String(body?.numero || "").replace(/\D/g, "");
    const nome = String(body?.nome || "").trim().slice(0, 120);
    const validade = String(body?.validade || "").trim().slice(0, 5);
    const bandeira = String(body?.bandeira || "").trim().toLowerCase().slice(0, 30);

    if (numero.length < 13 || numero.length > 19) {
        return { erro: "Informe um número de cartão válido." };
    }

    if (!nome || !/^\d{2}\/\d{2}$/.test(validade)) {
        return { erro: "Informe nome e validade do cartão." };
    }

    if (!bandeira) {
        return { erro: "Informe a bandeira do cartão." };
    }

    return {
        numero,
        nome,
        validade,
        bandeira
    };
}

function lerCartao(row) {
    try {
        return cartaoPublico(row, descriptografarDadosCartao(row.dados_criptografados));
    } catch {
        return cartaoPublico(row);
    }
}

router.get("/:id/cartoes", (req, res) => {
    const usuarioId = obterUsuarioId(req.params.id);

    if (!usuarioId) {
        return res.status(400).json({ erro: "Usuário inválido." });
    }

    db.query(
        `SELECT id, bandeira, ultimos_digitos, dados_criptografados, criado_em, atualizado_em
         FROM cartoes WHERE usuario_id = ? ORDER BY atualizado_em DESC, id DESC`,
        [usuarioId],
        (err, rows) => {
            if (err) return res.status(500).json({ erro: err.message });
            res.status(200).json(rows.map(lerCartao));
        }
    );
});

router.post("/:id/cartoes", (req, res) => {
    const usuarioId = obterUsuarioId(req.params.id);
    const dados = validarDadosCartao(req.body);

    if (!usuarioId) return res.status(400).json({ erro: "Usuário inválido." });
    if (dados.erro) return res.status(400).json({ erro: dados.erro });

    const dadosCriptografados = criptografarDadosCartao({
        nome: dados.nome,
        validade: dados.validade
    });

    db.query(
        `INSERT INTO cartoes (usuario_id, bandeira, ultimos_digitos, dados_criptografados)
         VALUES (?, ?, ?, ?)`,
        [usuarioId, dados.bandeira, dados.numero.slice(-4), dadosCriptografados],
        (err, result) => {
            if (err) return res.status(500).json({ erro: err.message });
            res.status(201).json({
                mensagem: "Cartão salvo com segurança.",
                cartao: cartaoPublico(
                    { id: result.insertId, bandeira: dados.bandeira, ultimos_digitos: dados.numero.slice(-4) },
                    dados
                )
            });
        }
    );
});

router.put("/:id/cartoes/:cartaoId", (req, res) => {
    const usuarioId = obterUsuarioId(req.params.id);
    const cartaoId = obterUsuarioId(req.params.cartaoId);
    const nome = String(req.body?.nome || "").trim().slice(0, 120);
    const validade = String(req.body?.validade || "").trim().slice(0, 5);

    if (!usuarioId || !cartaoId) return res.status(400).json({ erro: "Cartão inválido." });
    if (!nome || !/^\d{2}\/\d{2}$/.test(validade)) {
        return res.status(400).json({ erro: "Informe nome e validade do cartão." });
    }

    db.query(
        "SELECT id, bandeira, ultimos_digitos FROM cartoes WHERE id = ? AND usuario_id = ? LIMIT 1",
        [cartaoId, usuarioId],
        (err, rows) => {
            if (err) return res.status(500).json({ erro: err.message });
            if (!rows.length) return res.status(404).json({ erro: "Cartão não encontrado." });

            const dadosCriptografados = criptografarDadosCartao({ nome, validade });
            db.query(
                "UPDATE cartoes SET dados_criptografados = ? WHERE id = ? AND usuario_id = ?",
                [dadosCriptografados, cartaoId, usuarioId],
                (updateErr) => {
                    if (updateErr) return res.status(500).json({ erro: updateErr.message });
                    res.status(200).json({
                        mensagem: "Cartão atualizado com segurança.",
                        cartao: cartaoPublico(rows[0], { nome, validade })
                    });
                }
            );
        }
    );
});

router.delete("/:id/cartoes/:cartaoId", (req, res) => {
    const usuarioId = obterUsuarioId(req.params.id);
    const cartaoId = obterUsuarioId(req.params.cartaoId);

    if (!usuarioId || !cartaoId) return res.status(400).json({ erro: "Cartão inválido." });

    db.query(
        "DELETE FROM cartoes WHERE id = ? AND usuario_id = ?",
        [cartaoId, usuarioId],
        (err, result) => {
            if (err) return res.status(500).json({ erro: err.message });
            if (!result.affectedRows) return res.status(404).json({ erro: "Cartão não encontrado." });
            res.status(200).json({ mensagem: "Cartão removido." });
        }
    );
});

export default router;
