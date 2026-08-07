import { Router } from "express";
import db from "../database/connection.js";
import bcrypt from "bcryptjs";

const router = Router();

function parseCarrinho(valor) {
    if (!valor) {
        return [];
    }

    if (Array.isArray(valor)) {
        return valor;
    }

    try {
        const parsed = typeof valor === "string" ? JSON.parse(valor) : valor;
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function sanitizarItensCarrinho(itens) {
    if (!Array.isArray(itens)) {
        return [];
    }

    return itens
        .filter((item) => item && item.id != null && item.nome)
        .map((item) => ({
            id: Number(item.id),
            nome: String(item.nome),
            preco: Number(item.preco || 0),
            imagem: String(item.imagem || ""),
            quantidade: Math.max(1, Number(item.quantidade || 1))
        }));
}

router.get("/:id/carrinho", (req, res) => {
    const usuarioId = Number(req.params.id);

    if (!usuarioId) {
        return res.status(400).json({ erro: "Usuário inválido." });
    }

    const sql = "SELECT carrinho FROM usuarios WHERE id = ? LIMIT 1";

    db.query(sql, [usuarioId], (err, result) => {
        if (err) {
            return res.status(500).json({ erro: err.message });
        }

        if (result.length === 0) {
            return res.status(404).json({ erro: "Usuário não encontrado." });
        }

        res.status(200).json(parseCarrinho(result[0].carrinho));
    });
});

router.put("/:id/carrinho", (req, res) => {
    const usuarioId = Number(req.params.id);
    const itens = sanitizarItensCarrinho(req.body?.items);

    if (!usuarioId) {
        return res.status(400).json({ erro: "Usuário inválido." });
    }

    const sql = "UPDATE usuarios SET carrinho = ? WHERE id = ?";

    db.query(sql, [JSON.stringify(itens), usuarioId], (err, result) => {
        if (err) {
            return res.status(500).json({ erro: err.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ erro: "Usuário não encontrado." });
        }

        res.status(200).json({
            mensagem: "Carrinho atualizado com sucesso.",
            items: itens
        });
    });
});

// Buscar todos os usuários
router.get("/", (req, res) => {

    const sql = "SELECT * FROM usuarios";

    db.query(sql, (err, result) => {

        if (err) {
            return res.status(500).json({
                erro: err.message
            });
        }

        res.status(200).json(result);

    });

});

// Cadastrar usuário
router.post("/", (req, res) => {

    const { nome, email, senha, funcao = "cliente", superadmin = false } = req.body;
    const senhaCriptografada = bcrypt.hashSync(senha, 10);

    const sql = `
        INSERT INTO usuarios(nome, superadmin, funcao, email, senha)
        VALUES (?,?,?,?,?)
    `;

    db.query(sql, [nome, superadmin, funcao, email, senhaCriptografada], (err, result) => {

        if (err) {
            return res.status(500).json({
                erro: err.message
            });
        }

        res.status(201).json({
            mensagem: "Usuário cadastrado com sucesso!",
            id: result.insertId
        });

    });

});

// Login do usuário
router.post("/login", (req, res) => {

    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({
            erro: "Informe email e senha."
        });
    }

    const sql = `
        SELECT id, nome, email, senha
        FROM usuarios
        WHERE email = ? AND senha = ?
        LIMIT 1
    `;

    const sqlPorEmail = `
        SELECT id, nome, email, senha, superadmin, funcao
        FROM usuarios
        WHERE email = ?
        LIMIT 1
    `;

    db.query(sqlPorEmail, [email], (err, result) => {

        if (err) {
            return res.status(500).json({
                erro: err.message
            });
        }

        if (result.length === 0) {
            return res.status(401).json({
                erro: "Email ou senha inválidos."
            });
        }

        const usuario = result[0];
        const senhaValida = bcrypt.compareSync(senha, usuario.senha) || usuario.senha === senha;

        if (!senhaValida) {
            return res.status(401).json({
                erro: "Email ou senha inválidos."
            });
        }

        res.status(200).json({
            mensagem: "Login realizado com sucesso!",
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                funcao: String(usuario.funcao ?? usuario.funcoes ?? usuario.cargo ?? "").toLowerCase(),
                superadmin: Boolean(usuario.superadmin)
            }
        });

    });

});

export default router;