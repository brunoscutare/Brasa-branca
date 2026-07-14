import { Router } from "express";
import db from "../database/connection.js";
import bcrypt from "bcryptjs";

const router = Router();

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