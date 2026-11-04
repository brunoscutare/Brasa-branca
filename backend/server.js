import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import { mkdir } from "fs/promises";

import db, { inicializarBanco } from "./database/connection.js";
import usuariosRoutes from "./routes/usuarios.js";
import produtoRoutes from "./routes/produto.js";
import cartoesRoutes from "./routes/cartoes.js";
import pedidosRoutes from "./routes/pedidos.js";
import iaRoutes from "./routes/ia.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsPath = path.join(__dirname, "uploads");
const upload = multer({ dest: uploadsPath });

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(uploadsPath));

app.get("/", (req, res) => {
    res.send("API funcionando!");
});

app.use("/usuarios", usuariosRoutes);
app.use("/usuarios", cartoesRoutes);
app.use("/usuarios", pedidosRoutes);
app.use("/ia", iaRoutes);
app.use("/produtos-api", produtoRoutes);

app.get("/cardapio", (req, res) => {
    const sql = `
        SELECT id, nome, descricao, preco, imagem, sobremesa, exibir_no_cardapio, criado_em, atualizado_em
        FROM produtos
        WHERE exibir_no_cardapio = 1
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

const PORT = Number(process.env.PORT || 3000);

try {
    await mkdir(uploadsPath, { recursive: true });
    await inicializarBanco();

    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
        console.log("Banco conectado e schema verificado com sucesso!");
    });
} catch (error) {
    console.error("Não foi possível iniciar o backend.");
    console.error(`Banco: ${error.code || error.message}`);
    console.error("Configure DB_HOST, DB_PORT, DB_USER, DB_PASSWORD e DB_NAME antes de iniciar.");
    process.exitCode = 1;
}
