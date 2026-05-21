-- Use este arquivo no SQL Editor se quiser criar os usuários de demonstração via SQL.
-- Se seu projeto Supabase bloquear escrita direta em auth.users, crie os usuários
-- manualmente em Authentication > Users com senha 123456 e depois rode schema.sql.

create extension if not exists "pgcrypto";

do $$
declare
  item jsonb;
  user_id uuid;
  users jsonb := '[
    {"email":"admin@gmail.com","password":"123456"},
    {"email":"adm@gmail.com","password":"123456"},
    {"email":"mecanica@gmail.com","password":"123456"},
    {"email":"usinagem@gmail.com","password":"123456"},
    {"email":"eletrica@gmail.com","password":"123456"},
    {"email":"gestor@gmail.com","password":"123456"},
    {"email":"cliente@gmail.com","password":"123456"}
  ]'::jsonb;
begin
  for item in select * from jsonb_array_elements(users)
  loop
    select id into user_id
    from auth.users
    where email = item->>'email'
    limit 1;

    if user_id is null then
      user_id := gen_random_uuid();

      insert into auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        recovery_token,
        email_change_token_new,
        email_change
      )
      values (
        '00000000-0000-0000-0000-000000000000',
        user_id,
        'authenticated',
        'authenticated',
        item->>'email',
        crypt(item->>'password', gen_salt('bf')),
        now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{}'::jsonb,
        now(),
        now(),
        '',
        '',
        '',
        ''
      );

      insert into auth.identities (
        id,
        user_id,
        provider_id,
        identity_data,
        provider,
        last_sign_in_at,
        created_at,
        updated_at
      )
      values (
        gen_random_uuid(),
        user_id,
        user_id::text,
        jsonb_build_object('sub', user_id::text, 'email', item->>'email'),
        'email',
        now(),
        now(),
        now()
      )
      on conflict (provider, provider_id) do nothing;
    end if;
  end loop;
end $$;
