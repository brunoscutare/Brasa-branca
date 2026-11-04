# Backend Brasa-branca

## Configuração

1. Copie `.env.example` para `.env`.
2. Informe em `DB_PASSWORD` a senha que funciona no MySQL Workbench para o usuário configurado em `DB_USER`.
3. Defina `CARD_ENCRYPTION_KEY` com uma chave longa e secreta.
4. Confirme que o banco `database-brasa` existe.

Inicie com:

```bash
npm start
```

O servidor só abre a porta depois de validar a conexão e garantir as colunas necessárias. Se a senha estiver errada, o processo termina com uma mensagem clara em vez de deixar uma API aparentemente online.

O backend não grava número completo nem CVV. Ele armazena somente os quatro últimos dígitos, a bandeira e os dados necessários para exibir o cartão protegidos com AES-256-GCM. O CVV nunca é persistido.
