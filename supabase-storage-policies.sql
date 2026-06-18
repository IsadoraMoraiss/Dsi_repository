-- Configuracao usada pelo projeto academico oficial.
-- Os buckets sao publicos e a chave publica anonima pode enviar e remover imagens.
-- Nao use estas policies em um aplicativo de producao.

begin;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('foto-perfil', 'foto-perfil', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('foto-capa-roteiro', 'foto-capa-roteiro', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Firebase users upload own profile images" on storage.objects;
drop policy if exists "Firebase users delete own profile images" on storage.objects;
drop policy if exists "Firebase users upload own itinerary images" on storage.objects;
drop policy if exists "Firebase users delete own itinerary images" on storage.objects;
drop policy if exists "Official app upload profile images" on storage.objects;
drop policy if exists "Official app delete profile images" on storage.objects;
drop policy if exists "Official app upload itinerary images" on storage.objects;
drop policy if exists "Official app delete itinerary images" on storage.objects;

create policy "Official app upload profile images"
on storage.objects for insert to anon, authenticated
with check (bucket_id = 'foto-perfil');

create policy "Official app delete profile images"
on storage.objects for delete to anon, authenticated
using (bucket_id = 'foto-perfil');

create policy "Official app upload itinerary images"
on storage.objects for insert to anon, authenticated
with check (bucket_id = 'foto-capa-roteiro');

create policy "Official app delete itinerary images"
on storage.objects for delete to anon, authenticated
using (bucket_id = 'foto-capa-roteiro');

commit;
