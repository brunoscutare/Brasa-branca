import crypto from "crypto";

const encryptionKey = crypto
    .createHash("sha256")
    .update(process.env.CARD_ENCRYPTION_KEY || process.env.DB_PASSWORD || "brasa-branca-local-key")
    .digest();

export function criptografarDadosCartao(dados) {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey, iv);
    const encrypted = Buffer.concat([
        cipher.update(JSON.stringify(dados), "utf8"),
        cipher.final()
    ]);

    return JSON.stringify({
        iv: iv.toString("base64"),
        tag: cipher.getAuthTag().toString("base64"),
        dados: encrypted.toString("base64")
    });
}

export function descriptografarDadosCartao(valor) {
    const payload = typeof valor === "string" ? JSON.parse(valor) : valor;
    const decipher = crypto.createDecipheriv(
        "aes-256-gcm",
        encryptionKey,
        Buffer.from(payload.iv, "base64")
    );
    decipher.setAuthTag(Buffer.from(payload.tag, "base64"));

    const decrypted = Buffer.concat([
        decipher.update(Buffer.from(payload.dados, "base64")),
        decipher.final()
    ]);

    return JSON.parse(decrypted.toString("utf8"));
}

export function cartaoPublico(row, dados = null) {
    return {
        id: row.id,
        bandeira: row.bandeira,
        ultimos_digitos: row.ultimos_digitos,
        nome: dados?.nome || "",
        validade: dados?.validade || "",
        criado_em: row.criado_em,
        atualizado_em: row.atualizado_em
    };
}
