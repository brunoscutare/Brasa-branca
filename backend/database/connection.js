import mysql from "mysql2";

const db = mysql.createPool({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "database-brasa",
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
    queueLimit: 0,
    charset: "utf8mb4"
});

const promiseDb = db.promise();

async function garantirColuna(sql) {
    try {
        await promiseDb.query(sql);
    } catch (error) {
        if (error.code !== "ER_DUP_FIELDNAME") {
            throw error;
        }
    }
}

export async function inicializarBanco() {
    await promiseDb.query("SELECT 1");
    await garantirColuna(
        "ALTER TABLE produtos ADD COLUMN exibir_no_cardapio TINYINT(1) NOT NULL DEFAULT 1"
    );
    await garantirColuna("ALTER TABLE usuarios ADD COLUMN carrinho JSON NULL");
    await garantirColuna("ALTER TABLE usuarios ADD COLUMN endereco JSON NULL");
    await promiseDb.query(
        "UPDATE usuarios SET funcao = 'funcionario' WHERE LOWER(COALESCE(funcao, '')) IN ('administrador', 'admin')"
    );

    await promiseDb.query(`
        CREATE TABLE IF NOT EXISTS cartoes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            usuario_id INT NOT NULL,
            bandeira VARCHAR(30) NOT NULL,
            ultimos_digitos CHAR(4) NOT NULL,
            dados_criptografados TEXT NOT NULL,
            criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_cartoes_usuario (usuario_id),
            CONSTRAINT fk_cartoes_usuario
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await promiseDb.query(`
        CREATE TABLE IF NOT EXISTS pedidos (
            id INT AUTO_INCREMENT PRIMARY KEY,
            usuario_id INT NOT NULL,
            cartao_id INT NULL,
            status VARCHAR(30) NOT NULL DEFAULT 'indo_ate_voce',
            total DECIMAL(10, 2) NOT NULL,
            endereco TEXT NULL,
            bandeira VARCHAR(30) NOT NULL,
            ultimos_digitos CHAR(4) NOT NULL,
            criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_pedidos_usuario (usuario_id),
            CONSTRAINT fk_pedidos_usuario
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
            CONSTRAINT fk_pedidos_cartao
                FOREIGN KEY (cartao_id) REFERENCES cartoes(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await promiseDb.query("ALTER TABLE pedidos MODIFY COLUMN status VARCHAR(30) NOT NULL DEFAULT 'indo_ate_voce'");

    await garantirColuna("ALTER TABLE pedidos ADD COLUMN endereco TEXT NULL");

    await promiseDb.query(`
        CREATE TABLE IF NOT EXISTS pedido_itens (
            id INT AUTO_INCREMENT PRIMARY KEY,
            pedido_id INT NOT NULL,
            produto_id INT NULL,
            nome VARCHAR(180) NOT NULL,
            preco DECIMAL(10, 2) NOT NULL,
            quantidade INT NOT NULL,
            imagem VARCHAR(500) NULL,
            INDEX idx_pedido_itens_pedido (pedido_id),
            CONSTRAINT fk_pedido_itens_pedido
                FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await promiseDb.query(`
        CREATE TABLE IF NOT EXISTS avaliacoes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            pedido_id INT NOT NULL UNIQUE,
            usuario_id INT NOT NULL,
            nota TINYINT NOT NULL,
            comentario VARCHAR(1000) NULL,
            criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_avaliacoes_usuario (usuario_id),
            CONSTRAINT fk_avaliacoes_pedido
                FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
            CONSTRAINT fk_avaliacoes_usuario
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
}

export default db;
