import { Router } from "express";
import db from "../database/connection.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { unlink } from "fs/promises";

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

const removerImagemDaPasta = async (imagem) => {
    if (!imagem || !imagem.startsWith("/uploads/")) {
        return;
    }

    const nomeArquivo = path.basename(imagem);
    const caminhoArquivo = path.join(uploadsDir, nomeArquivo);

    try {
        await unlink(caminhoArquivo);
    } catch (error) {
        if (error.code !== "ENOENT") {
            throw error;
        }
    }
};

const parseBool = (value) => value === true || value === "true" || value === 1 || value === "1";

router.get("/", (req, res) => {
    const sql = `
        SELECT id, nome, descricao, preco, imagem, sobremesa, exibir_no_cardapio, criado_em, atualizado_em
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

router.get("/:id", (req, res) => {
    const { id } = req.params;

    const sql = `
        SELECT id, nome, descricao, preco, imagem, sobremesa, exibir_no_cardapio, criado_em, atualizado_em
        FROM produtos
        WHERE id = ?
        LIMIT 1
    `;

    db.query(sql, [id], (err, rows) => {
        if (err) {
            return res.status(500).json({ erro: err.message });
        }

        if (!rows.length) {
            return res.status(404).json({ erro: "Produto não encontrado." });
        }

        res.status(200).json(rows[0]);
    });
});

router.post("/", upload.single("imagem"), (req, res) => {
    const { nome, descricao = "", preco, sobremesa = false, exibir_no_cardapio = false } = req.body;
    const imagem = req.file ? `/uploads/${req.file.filename}` : "";

    if (!nome || preco === undefined || preco === null || preco === "") {
        return res.status(400).json({ erro: "Informe nome e preço." });
    }

    const sql = `
        INSERT INTO produtos (nome, descricao, preco, imagem, sobremesa, exibir_no_cardapio)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [nome, descricao, preco, imagem, parseBool(sobremesa), parseBool(exibir_no_cardapio)],
        (err, result) => {
            if (err) {
                return res.status(500).json({ erro: err.message });
            }

            res.status(201).json({
                mensagem: "Produto cadastrado com sucesso!",
                id: result.insertId
            });
        }
    );
});

router.put("/:id", upload.single("imagem"), (req, res) => {
    const { id } = req.params;
    const { nome, descricao = "", preco, sobremesa = false, exibir_no_cardapio = false } = req.body;

    if (!nome || preco === undefined || preco === null || preco === "") {
        return res.status(400).json({ erro: "Informe nome e preço." });
    }

    db.query("SELECT imagem FROM produtos WHERE id = ?", [id], async (err, rows) => {
        if (err) {
            return res.status(500).json({ erro: err.message });
        }

        if (!rows.length) {
            return res.status(404).json({ erro: "Produto não encontrado." });
        }

        let imagem = rows[0].imagem;

        if (req.file) {
            try {
                await removerImagemDaPasta(imagem);
            } catch (error) {
                return res.status(500).json({ erro: error.message });
            }

            imagem = `/uploads/${req.file.filename}`;
        }

        const sql = `
            UPDATE produtos
            SET nome = ?, descricao = ?, preco = ?, imagem = ?, sobremesa = ?, exibir_no_cardapio = ?
            WHERE id = ?
        `;

        db.query(
            sql,
            [nome, descricao, preco, imagem, parseBool(sobremesa), parseBool(exibir_no_cardapio), id],
            (updateErr) => {
                if (updateErr) {
                    return res.status(500).json({ erro: updateErr.message });
                }

                res.status(200).json({
                    mensagem: "Produto atualizado com sucesso.",
                    id: Number(id)
                });
            }
        );
    });
});

router.patch("/:id/cardapio", (req, res) => {
    const { id } = req.params;
    const { exibir_no_cardapio } = req.body;

    if (exibir_no_cardapio === undefined) {
        return res.status(400).json({ erro: "Informe se o produto deve aparecer no cardápio." });
    }

    db.query(
        "UPDATE produtos SET exibir_no_cardapio = ? WHERE id = ?",
        [parseBool(exibir_no_cardapio) ? 1 : 0, id],
        (err, result) => {
            if (err) {
                return res.status(500).json({ erro: err.message });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ erro: "Produto não encontrado." });
            }

            res.status(200).json({
                mensagem: "Visibilidade no cardápio atualizada.",
                id: Number(id),
                exibir_no_cardapio: parseBool(exibir_no_cardapio)
            });
        }
    );
});

router.delete("/:id", (req, res) => {
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

export default router;
