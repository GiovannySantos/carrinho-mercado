# Carrinho de Mercado

Web app responsivo com modo guest offline (IndexedDB) e modo logado com sync via Supabase.

## Stack

- Next.js (App Router) + TypeScript + Tailwind
- Supabase (Postgres + Auth Google)
- Recharts
- Localforage (IndexedDB)

## Setup Supabase

1. Crie um projeto no Supabase.
2. Ative o provedor Google em **Auth → Providers**.
3. No SQL Editor, execute o arquivo `supabase/schema.sql`.
4. Copie as credenciais do projeto e configure as env vars:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Rodar localmente

```bash
npm install
npm run dev
```

## Deploy na Vercel

1. Conecte este repositório na Vercel.
2. Configure as env vars do Supabase.
3. Faça o deploy.

## Observações

- Dinheiro é sempre armazenado em centavos (inteiro).
- Não use `user_id` do client: o Supabase usa `auth.uid()`.
- Há 1 carrinho aberto por dia por usuário, garantido pelo índice único.
