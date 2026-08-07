import mysql from "mysql2";

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "102030",
    database: "database-brasa"
});

db.connect((err) => {
    if (err) {
        console.error("Erro ao conectar ao banco:", err);
        return;
    }

    console.log("Banco conectado com sucesso!");

    db.query(
        "ALTER TABLE produtos ADD COLUMN exibir_no_cardapio TINYINT(1) NOT NULL DEFAULT 1",
        (alterErr) => {
            if (alterErr && alterErr.code !== "ER_DUP_FIELDNAME") {
                console.error("Erro ao garantir coluna exibir_no_cardapio:", alterErr.message);
            }
        }
    );

    db.query(
        "ALTER TABLE usuarios ADD COLUMN carrinho JSON NULL",
        (alterErr) => {
            if (alterErr && alterErr.code !== "ER_DUP_FIELDNAME") {
                console.error("Erro ao garantir coluna carrinho:", alterErr.message);
            }
        }
    );
});

export default db;