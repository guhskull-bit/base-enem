# Base ENEM

Plataforma de estudos do ENEM para o Colégio Santa Marcelina · RJ.

## O que foi criado

- Login institucional com e-mail e senha
- Dashboard do aluno
- Simulado com feedback imediato
- Resultado e progresso
- Ranking por turma
- Conquistas
- Painel administrativo
- Schema Supabase com RLS, views e seed

## Como rodar

```bash
npm install
npm run dev
```

## Deploy na Vercel

1. Envie este repositório para GitHub.
2. Importe o projeto na Vercel.
3. Configure as variáveis de ambiente:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

4. Faça o deploy.
5. A aplicação vai ficar acessível pela URL gerada pela Vercel.

## Variáveis de ambiente

Crie um `.env.local` com:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Como configurar o Supabase

1. Crie um projeto no Supabase.
2. Aplique a migration em `supabase/migrations/0001_base_enem.sql`.
3. Rode o seed com `npm run seed` depois de preencher as variáveis.
4. Verifique se o Auth está ativo com senha.

## Regras de login

- O acesso é só com e-mail institucional e senha.
- O domínio permitido é exatamente `@santamarcelina.edu.br`.
- Não existe cadastro público.
- Os alunos são cadastrados pelo administrador.
- Não há login com Google.

## Acesso de teste

- Admin: `admin@santamarcelina.edu.br` / `Admin123!`
- Aluno: `ana.beatriz@santamarcelina.edu.br` / `Aluno123!`
- Aluno: `marina.lima@santamarcelina.edu.br` / `Aluno123!`
- Aluno: `carlos.silva@santamarcelina.edu.br` / `Aluno123!`
- Aluno: `pedro.costa@santamarcelina.edu.br` / `Aluno123!`
- Aluno: `joana.ribeiro@santamarcelina.edu.br` / `Aluno123!`

## Estrutura principal

- `app/login`
- `app/dashboard`
- `app/simulados`
- `app/ranking`
- `app/conquistas`
- `app/perfil`
- `app/admin`
- `lib/seed.ts`
- `lib/calculations.ts`
- `lib/auth.ts`
- `lib/guards.ts`
- `supabase/migrations/0001_base_enem.sql`

## Próximos passos

- Ligar as telas ao banco real em vez do modo demo local
- Expandir o CRUD administrativo com persistência completa
- Adicionar relatórios mais detalhados por disciplina e assunto
- Refinar a experiência mobile do simulado
