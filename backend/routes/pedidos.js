import { Router } from "express";
import db from "../database/connection.js";
import { criptografarDadosCartao } from "../security/cardData.js";

const router = Router();

function obterId(valor) {
    const id = Number(valor);
    return Number.isInteger(id) && id > 0 ? id : null;
}

function sanitizarItens(itens) {
    if (!Array.isArray(itens)) return [];

    return itens
        .filter((item) => item && obterId(item.id))
        .map((item) => ({
            id: obterId(item.id),
            quantidade: Math.max(1, Math.min(99, Number(item.quantidade) || 1))
        }));
}

function validarCartao(cartao) {
    const numero = String(cartao?.numero || "").replace(/\D/g, "");
    const nome = String(cartao?.nome || "").trim().slice(0, 120);
    const validade = String(cartao?.validade || "").trim().slice(0, 5);
    const bandeira = String(cartao?.bandeira || "").trim().toLowerCase().slice(0, 30);

    if (numero.length < 13 || numero.length > 19) return { erro: "Número de cartão inválido." };
    if (!nome || !/^\d{2}\/\d{2}$/.test(validade)) return { erro: "Dados do cartão incompletos." };
    if (!bandeira) return { erro: "Bandeira do cartão não informada." };

    return { numero, nome, validade, bandeira };
}

function validarEndereco(endereco) {
    const dados = {
        cep: String(endereco?.cep || "").trim().slice(0, 9),
        rua: String(endereco?.rua || "").trim().slice(0, 160),
        numero: String(endereco?.numero || "").trim().slice(0, 20),
        complemento: String(endereco?.complemento || "").trim().slice(0, 120),
        bairro: String(endereco?.bairro || "").trim().slice(0, 100),
        cidade: String(endereco?.cidade || "").trim().slice(0, 100),
        estado: String(endereco?.estado || "").trim().slice(0, 2).toUpperCase()
    };

    if (!dados.cep || !dados.rua || !dados.numero || !dados.bairro || !dados.cidade || !dados.estado) {
        return { erro: "Informe o endereço completo para entrega." };
    }

    return dados;
}

function lerEndereco(valor) {
    if (!valor) return null;

    try {
        return typeof valor === "string" ? JSON.parse(valor) : valor;
    } catch {
        return null;
    }
}

async function buscarPedidoCompleto(pedidoId, usuarioId, connection = db.promise()) {
    const [pedidos] = await connection.query(
        `SELECT pedidos.id, pedidos.status, pedidos.total, pedidos.endereco, pedidos.bandeira, pedidos.ultimos_digitos,
                pedidos.criado_em, pedidos.atualizado_em,
                avaliacoes.id AS avaliacao_id, avaliacoes.nota AS avaliacao_nota,
                avaliacoes.comentario AS avaliacao_comentario
         FROM pedidos
         LEFT JOIN avaliacoes ON avaliacoes.pedido_id = pedidos.id AND avaliacoes.usuario_id = pedidos.usuario_id
         WHERE pedidos.id = ? AND pedidos.usuario_id = ? LIMIT 1`,
        [pedidoId, usuarioId]
    );

    if (!pedidos.length) return null;

    const [itens] = await connection.query(
        `SELECT id, produto_id, nome, preco, quantidade, imagem
         FROM pedido_itens WHERE pedido_id = ? ORDER BY id ASC`,
        [pedidoId]
    );

    return { ...pedidos[0], endereco: lerEndereco(pedidos[0].endereco), itens };
}

router.get("/pedidos", async (req, res) => {
    try {
        const [pedidos] = await db.promise().query(
            `SELECT pedidos.id, pedidos.usuario_id, pedidos.status, pedidos.total, pedidos.endereco,
                    pedidos.bandeira, pedidos.ultimos_digitos, pedidos.criado_em, pedidos.atualizado_em,
                    usuarios.nome AS usuario_nome, usuarios.email AS usuario_email
             FROM pedidos
             INNER JOIN usuarios ON usuarios.id = pedidos.usuario_id
             ORDER BY pedidos.criado_em DESC, pedidos.id DESC`
        );

        const completos = await Promise.all(
            pedidos.map(async (pedido) => ({
                ...(await buscarPedidoCompleto(pedido.id, pedido.usuario_id)),
                usuario_nome: pedido.usuario_nome,
                usuario_email: pedido.usuario_email
            }))
        );

        res.status(200).json(completos);
    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
});

router.get("/avaliacoes", async (req, res) => {
    try {
        const [avaliacoes] = await db.promise().query(
            `SELECT avaliacoes.id, avaliacoes.pedido_id, avaliacoes.usuario_id,
                    avaliacoes.nota, avaliacoes.comentario, avaliacoes.criado_em, avaliacoes.atualizado_em,
                    usuarios.nome AS usuario_nome, usuarios.email AS usuario_email,
                    pedidos.total AS pedido_total, pedidos.criado_em AS pedido_criado_em
             FROM avaliacoes
             INNER JOIN usuarios ON usuarios.id = avaliacoes.usuario_id
             INNER JOIN pedidos ON pedidos.id = avaliacoes.pedido_id
             ORDER BY avaliacoes.criado_em DESC, avaliacoes.id DESC`
        );

        res.status(200).json(avaliacoes.map((avaliacao) => ({
            ...avaliacao,
            nota: Number(avaliacao.nota),
            pedido_total: Number(avaliacao.pedido_total)
        })));
    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
});

router.get("/financeiro", async (req, res) => {
    try {
        const [[resumo]] = await db.promise().query(
            `SELECT COALESCE(SUM(total), 0) AS faturamento,
                    COUNT(id) AS quantidade_pedidos,
                    COALESCE(AVG(total), 0) AS ticket_medio,
                    COUNT(DISTINCT usuario_id) AS clientes_atendidos,
                    COALESCE(SUM(CASE WHEN status = 'recebido' THEN total ELSE 0 END), 0) AS faturamento_recebido,
                    SUM(CASE WHEN status = 'recebido' THEN 1 ELSE 0 END) AS pedidos_recebidos,
                    SUM(CASE WHEN status <> 'recebido' THEN 1 ELSE 0 END) AS pedidos_em_andamento
             FROM pedidos`
        );
        const [porMes] = await db.promise().query(
            `SELECT DATE_FORMAT(criado_em, '%Y-%m') AS mes,
                    COALESCE(SUM(total), 0) AS faturamento,
                    COUNT(id) AS quantidade_pedidos
             FROM pedidos
             WHERE criado_em >= DATE_SUB(CURRENT_DATE(), INTERVAL 5 MONTH)
             GROUP BY DATE_FORMAT(criado_em, '%Y-%m')
             ORDER BY mes ASC`
        );
        const [pedidosRecentes] = await db.promise().query(
            `SELECT pedidos.id, pedidos.status, pedidos.total, pedidos.criado_em,
                    usuarios.nome AS usuario_nome, usuarios.email AS usuario_email
             FROM pedidos
             INNER JOIN usuarios ON usuarios.id = pedidos.usuario_id
             ORDER BY pedidos.criado_em DESC, pedidos.id DESC
             LIMIT 8`
        );

        res.status(200).json({
            resumo: {
                faturamento: Number(resumo.faturamento || 0),
                quantidade_pedidos: Number(resumo.quantidade_pedidos || 0),
                ticket_medio: Number(resumo.ticket_medio || 0),
                clientes_atendidos: Number(resumo.clientes_atendidos || 0),
                faturamento_recebido: Number(resumo.faturamento_recebido || 0),
                pedidos_recebidos: Number(resumo.pedidos_recebidos || 0),
                pedidos_em_andamento: Number(resumo.pedidos_em_andamento || 0)
            },
            porMes: porMes.map((mes) => ({ ...mes, faturamento: Number(mes.faturamento || 0), quantidade_pedidos: Number(mes.quantidade_pedidos || 0) })),
            pedidosRecentes: pedidosRecentes.map((pedido) => ({ ...pedido, total: Number(pedido.total || 0) }))
        });
    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
});

router.get("/:id/pedidos", async (req, res) => {
    const usuarioId = obterId(req.params.id);

    if (!usuarioId) return res.status(400).json({ erro: "Usuário inválido." });

    try {
        const [pedidos] = await db.promise().query(
            `SELECT id, status, total, bandeira, ultimos_digitos, criado_em, atualizado_em
             FROM pedidos WHERE usuario_id = ? ORDER BY criado_em DESC, id DESC`,
            [usuarioId]
        );

        const completos = await Promise.all(
            pedidos.map((pedido) => buscarPedidoCompleto(pedido.id, usuarioId))
        );

        res.status(200).json(completos.filter(Boolean));
    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
});

router.patch("/:id/pedidos/:pedidoId/status", async (req, res) => {
    const usuarioId = obterId(req.params.id);
    const pedidoId = obterId(req.params.pedidoId);

    if (!usuarioId || !pedidoId) return res.status(400).json({ erro: "Pedido inválido." });

    try {
        const [resultado] = await db.promise().query(
            "UPDATE pedidos SET status = 'recebido' WHERE id = ? AND usuario_id = ?",
            [pedidoId, usuarioId]
        );

        if (!resultado.affectedRows) return res.status(404).json({ erro: "Pedido não encontrado." });

        const pedido = await buscarPedidoCompleto(pedidoId, usuarioId);
        res.status(200).json({ mensagem: "Recebimento confirmado.", pedido });
    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
});

router.post("/:id/pedidos/:pedidoId/avaliacao", async (req, res) => {
    const usuarioId = obterId(req.params.id);
    const pedidoId = obterId(req.params.pedidoId);
    const nota = Number(req.body?.nota);
    const comentario = String(req.body?.comentario || "").trim().slice(0, 1000);

    if (!usuarioId || !pedidoId) return res.status(400).json({ erro: "Pedido inválido." });
    if (!Number.isInteger(nota) || nota < 1 || nota > 5) return res.status(400).json({ erro: "Escolha uma nota entre 1 e 5 estrelas." });

    try {
        const [pedidos] = await db.promise().query(
            "SELECT id FROM pedidos WHERE id = ? AND usuario_id = ? AND status = 'recebido' LIMIT 1",
            [pedidoId, usuarioId]
        );

        if (!pedidos.length) return res.status(400).json({ erro: "Confirme o recebimento do pedido antes de avaliá-lo." });

        await db.promise().query(
            `INSERT INTO avaliacoes (pedido_id, usuario_id, nota, comentario)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE nota = VALUES(nota), comentario = VALUES(comentario)`,
            [pedidoId, usuarioId, nota, comentario || null]
        );

        const pedido = await buscarPedidoCompleto(pedidoId, usuarioId);
        res.status(200).json({ mensagem: "Avaliação salva com sucesso.", pedido });
    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
});

router.post("/:id/pedidos", async (req, res) => {
    const usuarioId = obterId(req.params.id);
    const itensSolicitados = sanitizarItens(req.body?.items);
    const cartaoSalvoId = obterId(req.body?.cartao_id);
    const cartaoInformado = validarCartao(req.body?.cartao);
    const endereco = validarEndereco(req.body?.endereco);

    if (!usuarioId) return res.status(400).json({ erro: "Usuário inválido." });
    if (!itensSolicitados.length) return res.status(400).json({ erro: "O carrinho está vazio." });
    if (endereco.erro) return res.status(400).json({ erro: endereco.erro });
    if (!cartaoSalvoId && cartaoInformado.erro) {
        return res.status(400).json({ erro: cartaoInformado.erro });
    }

    const connection = await db.promise().getConnection();

    try {
        await connection.beginTransaction();

        const ids = [...new Set(itensSolicitados.map((item) => item.id))];
        const [produtos] = await connection.query(
            `SELECT id, nome, preco, imagem FROM produtos WHERE id IN (?)`,
            [ids]
        );
        const produtosPorId = new Map(produtos.map((produto) => [Number(produto.id), produto]));

        if (produtos.length !== ids.length) {
            throw new Error("Um ou mais produtos do carrinho não estão disponíveis.");
        }

        const itens = itensSolicitados.map((item) => {
            const produto = produtosPorId.get(item.id);
            return {
                ...produto,
                quantidade: item.quantidade,
                preco: Number(produto.preco)
            };
        });
        const total = itens.reduce((sum, item) => sum + item.preco * item.quantidade, 0);
        let cartaoId;
        let bandeira;
        let ultimosDigitos;

        if (cartaoSalvoId) {
            const [cartoes] = await connection.query(
                `SELECT id, bandeira, ultimos_digitos
                 FROM cartoes WHERE id = ? AND usuario_id = ? LIMIT 1`,
                [cartaoSalvoId, usuarioId]
            );

            if (!cartoes.length) {
                throw new Error("Cartão salvo não encontrado.");
            }

            cartaoId = cartoes[0].id;
            bandeira = cartoes[0].bandeira;
            ultimosDigitos = cartoes[0].ultimos_digitos;
        } else {
            const dadosCriptografados = criptografarDadosCartao({
                nome: cartaoInformado.nome,
                validade: cartaoInformado.validade
            });

            const [cartaoResult] = await connection.query(
                `INSERT INTO cartoes (usuario_id, bandeira, ultimos_digitos, dados_criptografados)
                 VALUES (?, ?, ?, ?)`,
                [usuarioId, cartaoInformado.bandeira, cartaoInformado.numero.slice(-4), dadosCriptografados]
            );

            cartaoId = cartaoResult.insertId;
            bandeira = cartaoInformado.bandeira;
            ultimosDigitos = cartaoInformado.numero.slice(-4);
        }

        const [pedidoResult] = await connection.query(
            `INSERT INTO pedidos (usuario_id, cartao_id, status, total, endereco, bandeira, ultimos_digitos)
             VALUES (?, ?, 'indo_ate_voce', ?, ?, ?, ?)`,
            [usuarioId, cartaoId, total.toFixed(2), JSON.stringify(endereco), bandeira, ultimosDigitos]
        );

        const values = itens.flatMap((item) => [
            pedidoResult.insertId,
            item.id,
            item.nome,
            item.preco.toFixed(2),
            item.quantidade,
            item.imagem || null
        ]);
        const placeholders = itens.map(() => "(?, ?, ?, ?, ?, ?)").join(", ");

        await connection.query(
            `INSERT INTO pedido_itens (pedido_id, produto_id, nome, preco, quantidade, imagem)
             VALUES ${placeholders}`,
            values
        );
        await connection.query("UPDATE usuarios SET carrinho = JSON_ARRAY() WHERE id = ?", [usuarioId]);
        await connection.commit();

        const pedido = await buscarPedidoCompleto(pedidoResult.insertId, usuarioId);
        res.status(201).json({ mensagem: "Pedido criado com sucesso.", pedido });
    } catch (error) {
        await connection.rollback();
        res.status(400).json({ erro: error.message });
    } finally {
        connection.release();
    }
});

export default router;
