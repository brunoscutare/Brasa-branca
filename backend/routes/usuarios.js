import { Router } from "express";
import db from "../database/connection.js";

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

    const { nome, email, senha } = req.body;

    const sql = `
        INSERT INTO usuarios(nome,email,senha)
        VALUES (?,?,?)
    `;

    db.query(sql, [nome, email, senha], (err, result) => {

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

export default router;