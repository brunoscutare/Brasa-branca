import { Router } from "express";
import db from "../database/connection.js";
import bcrypt from "bcryptjs";

const router = Router();

function normalizarFuncao(funcao) {
    const valor = String(funcao || "cliente").trim().toLowerCase();
    return ["administrador", "admin", "funcionario"].includes(valor) ? "funcionario" : "cliente";
}

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

function parseEndereco(valor) {
    if (!valor) return null;
    try {
        return typeof valor === "string" ? JSON.parse(valor) : valor;
    } catch {
        return null;
    }
}

function sanitizarEndereco(endereco) {
    if (!endereco) return null;

    const dados = {
        cep: String(endereco.cep || "").trim().slice(0, 9),
        rua: String(endereco.rua || "").trim().slice(0, 160),
        numero: String(endereco.numero || "").trim().slice(0, 20),
        complemento: String(endereco.complemento || "").trim().slice(0, 120),
        bairro: String(endereco.bairro || "").trim().slice(0, 100),
        cidade: String(endereco.cidade || "").trim().slice(0, 100),
        estado: String(endereco.estado || "").trim().slice(0, 2).toUpperCase()
    };

    const obrigatorios = ["cep", "rua", "numero", "bairro", "cidade", "estado"];
    return obrigatorios.every((campo) => dados[campo]) ? dados : null;
}

router.get("/clientes", (req, res) => {
    db.query(
        `SELECT usuarios.id, usuarios.nome, usuarios.email, usuarios.criado_em,
                COUNT(pedidos.id) AS quantidade_pedidos
         FROM usuarios
         LEFT JOIN pedidos ON pedidos.usuario_id = usuarios.id
         WHERE COALESCE(LOWER(usuarios.funcao), 'cliente') = 'cliente'
           AND COALESCE(usuarios.superadmin, 0) = 0
         GROUP BY usuarios.id, usuarios.nome, usuarios.email, usuarios.criado_em
         ORDER BY usuarios.nome ASC`,
        (err, rows) => {
            if (err) return res.status(500).json({ erro: err.message });
            res.status(200).json(rows.map((cliente) => ({
                ...cliente,
                quantidade_pedidos: Number(cliente.quantidade_pedidos || 0)
            })));
        }
    );
});

router.get("/:id/perfil", (req, res) => {
    const usuarioId = Number(req.params.id);

    if (!usuarioId) return res.status(400).json({ erro: "Usuário inválido." });

    db.query(
        `SELECT id, nome, email, superadmin, funcao, criado_em, endereco
         FROM usuarios WHERE id = ? LIMIT 1`,
        [usuarioId],
        (err, rows) => {
            if (err) return res.status(500).json({ erro: err.message });
            if (!rows.length) return res.status(404).json({ erro: "Usuário não encontrado." });

            const usuario = rows[0];
            res.status(200).json({
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                funcao: normalizarFuncao(usuario.funcao),
                superadmin: Boolean(usuario.superadmin),
                criado_em: usuario.criado_em,
                endereco: parseEndereco(usuario.endereco)
            });
        }
    );
});

router.put("/:id/perfil", (req, res) => {
    const usuarioId = Number(req.params.id);
    const nome = String(req.body?.nome || "").trim().slice(0, 120);
    const email = String(req.body?.email || "").trim().toLowerCase().slice(0, 160);
    const enderecoInformado = req.body?.endereco;
    const endereco = enderecoInformado ? sanitizarEndereco(enderecoInformado) : null;

    if (!usuarioId) return res.status(400).json({ erro: "Usuário inválido." });
    if (nome.length < 2) return res.status(400).json({ erro: "Informe um nome válido." });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ erro: "Informe um e-mail válido." });
    if (enderecoInformado && !endereco) return res.status(400).json({ erro: "Informe o endereço completo." });

    db.query(
        "UPDATE usuarios SET nome = ?, email = ?, endereco = ? WHERE id = ?",
        [nome, email, endereco ? JSON.stringify(endereco) : null, usuarioId],
        (err, result) => {
            if (err) {
                if (err.code === "ER_DUP_ENTRY") return res.status(409).json({ erro: "Este e-mail já está em uso." });
                return res.status(500).json({ erro: err.message });
            }
            if (!result.affectedRows) return res.status(404).json({ erro: "Usuário não encontrado." });

            res.status(200).json({ mensagem: "Perfil atualizado.", usuario: { id: usuarioId, nome, email, endereco } });
        }
    );
});

router.put("/:id/senha", (req, res) => {
    const usuarioId = Number(req.params.id);
    const senhaAtual = String(req.body?.senhaAtual || "");
    const novaSenha = String(req.body?.novaSenha || "");

    if (!usuarioId) return res.status(400).json({ erro: "Usuário inválido." });
    if (!senhaAtual || !novaSenha) return res.status(400).json({ erro: "Preencha a senha atual e a nova senha." });
    if (novaSenha.length < 6) return res.status(400).json({ erro: "A nova senha deve ter pelo menos 6 caracteres." });
    if (senhaAtual === novaSenha) return res.status(400).json({ erro: "A nova senha deve ser diferente da atual." });

    db.query("SELECT senha FROM usuarios WHERE id = ? LIMIT 1", [usuarioId], (selectErr, rows) => {
        if (selectErr) return res.status(500).json({ erro: selectErr.message });
        if (!rows.length) return res.status(404).json({ erro: "Usuário não encontrado." });

        const senhaArmazenada = String(rows[0].senha || "");
        let senhaValida = senhaAtual === senhaArmazenada;
        try {
            senhaValida = senhaValida || bcrypt.compareSync(senhaAtual, senhaArmazenada);
        } catch {
            senhaValida = false;
        }

        if (!senhaValida) return res.status(401).json({ erro: "A senha atual está incorreta." });

        const senhaCriptografada = bcrypt.hashSync(novaSenha, 10);
        db.query("UPDATE usuarios SET senha = ? WHERE id = ?", [senhaCriptografada, usuarioId], (updateErr) => {
            if (updateErr) return res.status(500).json({ erro: updateErr.message });
            res.status(200).json({ mensagem: "Senha alterada com sucesso." });
        });
    });
});

router.get("/funcionarios", (req, res) => {
    db.query(
        `SELECT id, nome, email, funcao, criado_em
         FROM usuarios
         WHERE LOWER(COALESCE(funcao, 'cliente')) = 'funcionario'
         ORDER BY nome ASC`,
        (err, rows) => {
            if (err) return res.status(500).json({ erro: err.message });
            res.status(200).json(rows.map((funcionario) => ({
                ...funcionario,
                funcao: normalizarFuncao(funcionario.funcao)
            })));
        }
    );
});

router.post("/funcionarios", (req, res) => {
    const nome = String(req.body?.nome || "").trim().slice(0, 120);
    const email = String(req.body?.email || "").trim().toLowerCase().slice(0, 160);
    const senha = String(req.body?.senha || "");

    if (nome.length < 2) return res.status(400).json({ erro: "Informe um nome válido." });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ erro: "Informe um e-mail válido." });
    if (senha.length < 6) return res.status(400).json({ erro: "A senha deve ter pelo menos 6 caracteres." });

    db.query(
        "INSERT INTO usuarios (nome, email, senha, funcao, superadmin) VALUES (?, ?, ?, 'funcionario', 0)",
        [nome, email, bcrypt.hashSync(senha, 10)],
        (err, result) => {
            if (err) {
                if (err.code === "ER_DUP_ENTRY") return res.status(409).json({ erro: "Este e-mail já está cadastrado." });
                return res.status(500).json({ erro: err.message });
            }

            res.status(201).json({
                mensagem: "Funcionário cadastrado com sucesso.",
                funcionario: { id: result.insertId, nome, email, funcao: "funcionario" }
            });
        }
    );
});

router.put("/funcionarios/:id", (req, res) => {
    const funcionarioId = Number(req.params.id);
    const usuarioId = Number(req.body?.usuario_id);
    const nome = String(req.body?.nome || "").trim().slice(0, 120);
    const email = String(req.body?.email || "").trim().toLowerCase().slice(0, 160);
    const senha = String(req.body?.senha || "");

    if (!funcionarioId) return res.status(400).json({ erro: "Funcionário inválido." });
    if (!usuarioId || usuarioId !== funcionarioId) return res.status(403).json({ erro: "Você só pode editar seus próprios dados." });
    if (nome.length < 2) return res.status(400).json({ erro: "Informe um nome válido." });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ erro: "Informe um e-mail válido." });
    if (senha && senha.length < 6) return res.status(400).json({ erro: "A senha deve ter pelo menos 6 caracteres." });

    const campos = senha ? "nome = ?, email = ?, senha = ?" : "nome = ?, email = ?";
    const valores = senha ? [nome, email, bcrypt.hashSync(senha, 10), funcionarioId] : [nome, email, funcionarioId];

    db.query(
        `UPDATE usuarios SET ${campos}
         WHERE id = ? AND LOWER(COALESCE(funcao, 'cliente')) = 'funcionario'`,
        valores,
        (err, result) => {
            if (err) {
                if (err.code === "ER_DUP_ENTRY") return res.status(409).json({ erro: "Este e-mail já está cadastrado." });
                return res.status(500).json({ erro: err.message });
            }
            if (!result.affectedRows) return res.status(404).json({ erro: "Funcionário não encontrado." });
            res.status(200).json({ mensagem: "Funcionário atualizado.", funcionario: { id: funcionarioId, nome, email, funcao: "funcionario" } });
        }
    );
});

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

    const nome = String(req.body?.nome || "").trim().slice(0, 120);
    const email = String(req.body?.email || "").trim().toLowerCase().slice(0, 160);
    const senha = String(req.body?.senha || "");
    const funcao = "cliente";
    const superadmin = false;

    if (nome.length < 2) return res.status(400).json({ erro: "Informe um nome vÃ¡lido." });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ erro: "Informe um e-mail vÃ¡lido." });
    if (senha.length < 6) return res.status(400).json({ erro: "A senha deve ter pelo menos 6 caracteres." });

    const senhaCriptografada = bcrypt.hashSync(senha, 10);

    const sql = `
        INSERT INTO usuarios(nome, superadmin, funcao, email, senha)
        VALUES (?,?,?,?,?)
    `;

    db.query(sql, [nome, superadmin, funcao, email, senhaCriptografada], (err, result) => {

        if (err) {
            if (err.code === "ER_DUP_ENTRY") {
                return res.status(409).json({ erro: "Este e-mail jÃ¡ estÃ¡ cadastrado." });
            }
            return res.status(500).json({
                erro: err.message
            });
        }

        res.status(201).json({
            mensagem: "Usuário cadastrado com sucesso!",
            id: result.insertId,
            usuario: {
                id: result.insertId,
                nome,
                email,
                funcao: "cliente",
                superadmin: false
            }
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
                funcao: normalizarFuncao(usuario.funcao ?? usuario.funcoes ?? usuario.cargo),
                superadmin: Boolean(usuario.superadmin)
            }
        });

    });

});

export default router;
