import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import { unlink } from "fs/promises";

import db from "./database/connection.js";
import usuariosRoutes from "./routes/usuarios.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsPath = path.join(__dirname, "uploads");
const upload = multer({ dest: uploadsPath });

const removerImagemDaPasta = async (imagem) => {
    if (!imagem || !imagem.startsWith("/uploads/")) {
        return;
    }

    const nomeArquivo = path.basename(imagem);
    const caminhoArquivo = path.join(uploadsPath, nomeArquivo);

    try {
        await unlink(caminhoArquivo);
    } catch (error) {
        if (error.code !== "ENOENT") {
            throw error;
        }
    }
};

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(uploadsPath));
app.use((req, _res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

app.get("/", (req, res) => {
    res.send("API funcionando!");
});

app.use("/usuarios", usuariosRoutes);

app.get("/cardapio", (req, res) => {
    console.log("GET /cardapio hit");
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

app.post("/cardapio", upload.single("imagem"), (req, res) => {
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

app.get("/produtos-api", (req, res) => {
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

app.post("/produtos-api", upload.single("imagem"), (req, res) => {
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

app.delete("/produtos-api/:id", (req, res) => {
    const { id } = req.params;

    db.query("SELECT imagem FROM produtos WHERE id = ?", [id], async (err, rows) => {
        if (err) {
            return res.status(500).json({ erro: err.message });
        }

        if (!rows.length) {
            return res.status(404).json({ erro: "Produto não encontrado." });
        }

        try {
            await removerImagemDaPasta(rows[0].imagem);
        } catch (error) {
            return res.status(500).json({ erro: error.message });
        }

        db.query("DELETE FROM produtos WHERE id = ?", [id], (deleteErr) => {
            if (deleteErr) {
                return res.status(500).json({ erro: deleteErr.message });
            }

            res.status(200).json({ mensagem: "Produto excluído com sucesso." });
        });
    });
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});