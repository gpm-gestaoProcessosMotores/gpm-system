# GPM - Gestão de Processos de Motores

Frontend em React.js para demonstração do sistema GPM, com Vite, React Router, dados mockados e persistência em `localStorage`.

## Rodar o projeto

```bash
npm install
npm run dev
```

Abra o GPM em:

```txt
http://localhost:5175/
```

O projeto foi fixado na porta `5175` para não misturar com outros Vites que já estejam usando `5173` ou `5174`.

## Supabase

O frontend já está preparado para usar Supabase Auth quando houver `.env`.

1. Crie um projeto no Supabase.
2. Copie `.env.example` para `.env`.
3. Preencha:

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

4. Crie os usuários de demonstração em Authentication > Users com senha `123456`, ou tente rodar [supabase/create-demo-auth-users.sql](/Users/silvianeschaffrath/gpm-system/supabase/create-demo-auth-users.sql) no SQL Editor.
5. Rode o SQL em [supabase/schema.sql](/Users/silvianeschaffrath/gpm-system/supabase/schema.sql) no SQL Editor.
6. Faça login como `admin@gmail.com` uma vez para o frontend sincronizar os dados mockados para a tabela `gpm_records`.
7. Reinicie o Vite.

Sem `.env`, o app continua usando os mocks/localStorage.

## Acessos de demonstração

Todos usam a senha `123456`.

- `admin@gmail.com` / `123456` - Administrador
- `adm@gmail.com` / `123456` - Administrativo
- `tecnico@gmail.com` / `123456` - Técnico
- `gestor@gmail.com` / `123456` - Gestor

Este projeto contém somente o frontend. Os services em `src/services` usam `localStorage` hoje e foram organizados para futura troca por APIs REST.

## Fluxo de cliente

- O cliente não precisa fazer login.
- Acesse `/consulta`.
- Consulte o código público `ISJE23AK` para ver a OS do cliente teste.
- Esse código é gerado quando a demanda/OS é criada pela equipe interna.

## Testes rápidos de permissão

- `tecnico@gmail.com` entra direto na área técnica integrada com Mecânica, Usinagem e Elétrica juntas.
- `adm@gmail.com` acessa motores, OS, orçamentos, pesquisa e histórico.
- `gestor@gmail.com` acessa dashboard, relatórios, OS e histórico.
- `admin@gmail.com` acessa tudo, incluindo usuários, funcionários, setores, clientes e a área técnica.

Os mocks incluem `OS0001` com código público `ISJE23AK`, além de outras OS em Mecânica, Usinagem e Elétrica.

## Se o navegador parecer não atualizar

1. Confirme que está acessando `http://localhost:5175/`.
2. Saia do sistema e entre de novo.
3. Se ainda aparecer sessão antiga, limpe o localStorage do navegador para esse endereço.

Isso evita continuar vendo outro projeto ou um login antigo salvo no navegador.
