import { Router } from "express";
import db from "../database/connection.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "..", "uploads");

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (_req, file, cb) => {
        const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, "-");
        cb(null, `${Date.now()}-${safeName}`);
    }
});

const upload = multer({ storage });

const router = Router();

router.get("/", (req, res) => {
    const sql = `
        SELECT id, nome, descricao, preco, imagem, sobremesa, criado_em, atualizado_em
        FROM produtos
        ORDER BY criado_em DESC, id DESC
    `;

    db.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json({ erro: err.message });
        }

        res.status(200).json(result);
    });
});

router.post("/", upload.single("imagem"), (req, res) => {
    const { nome, descricao = "", preco, sobremesa = false } = req.body;
    const imagem = req.file ? `/uploads/${req.file.filename}` : "";

    if (!nome || preco === undefined || preco === null || preco === "") {
        return res.status(400).json({ erro: "Informe nome e preço." });
    }

    const sql = `
        INSERT INTO produtos (nome, descricao, preco, imagem, sobremesa)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(sql, [nome, descricao, preco, imagem, sobremesa === true || sobremesa === "true"], (err, result) => {
        if (err) {
            return res.status(500).json({ erro: err.message });
        }

        res.status(201).json({
            mensagem: "Produto cadastrado com sucesso!",
            id: result.insertId
        });
    });
});

export default router;