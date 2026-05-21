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

4. Crie o usuário administrador inicial em Authentication > Users com e-mail `admin@gmail.com` e senha `123456`, ou tente rodar [supabase/create-demo-auth-users.sql](/Users/silvianeschaffrath/gpm-system/supabase/create-demo-auth-users.sql) no SQL Editor.
5. Rode o SQL em [supabase/schema.sql](/Users/silvianeschaffrath/gpm-system/supabase/schema.sql) no SQL Editor.
6. Faça login como `admin@gmail.com` uma vez para o frontend sincronizar os dados mockados para a tabela `gpm_records`.
7. Reinicie o Vite.

Sem `.env`, o app continua usando os mocks/localStorage.

## Acesso inicial

O app começa somente com o administrador abaixo. Os demais usuários devem ser criados pelo próprio admin na tela **Usuários**.

- `admin@gmail.com` / `123456` - Administrador

Este projeto contém somente o frontend. Os services em `src/services` usam `localStorage` hoje e foram organizados para futura troca por APIs REST.

## Fluxo de cliente

- Crie um usuário com perfil `Cliente` em **Usuários** ou marque o acesso no cadastro do cliente.
- O sistema redireciona para `/cliente/consulta-os`.
- Consulte `OS0001` para ver a OS do cliente teste.
- Consulte `OS0002` para ver o bloqueio: a OS pertence a outro cliente.

## Testes rápidos de permissão

- Crie usuários com os perfis Técnico Mecânica, Técnico Usinagem, Técnico Elétrica, Administrativo, Gestor e Cliente para testar os menus por permissão.
- `admin@gmail.com` acessa tudo, incluindo usuários, funcionários, setores e as áreas técnicas.

Os mocks incluem `OS0001` para Cliente Teste, `OS0002` para Outro Cliente, `OS0003` na Mecânica, `OS0004` na Usinagem e `OS0005` na Elétrica.

## Se o navegador parecer não atualizar

1. Confirme que está acessando `http://localhost:5175/`.
2. Saia do sistema e entre de novo.
3. Se ainda aparecer sessão antiga, limpe o localStorage do navegador para esse endereço.

Isso evita continuar vendo outro projeto ou um login antigo salvo no navegador.
