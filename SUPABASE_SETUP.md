# Configuração do Supabase Storage

## 1. Criar buckets no Supabase Dashboard

Acesse [https://supabase.com](https://supabase.com) e vá para seu projeto.

### Passo 1: Storage > Buckets
1. Clique em **Storage** na barra lateral esquerda
2. Clique em **Create a new bucket**
3. Crie dois buckets com as seguintes configurações:

#### Bucket 1: `foto-perfil`
- **Name:** `foto-perfil`
- **Privacy:** Public
- Clique **Create bucket**

#### Bucket 2: `foto-capa-roteiro`
- **Name:** `foto-capa-roteiro`
- **Privacy:** Public
- Clique **Create bucket**

## 2. Configurar CORS (Regras de Segurança)

### Para cada bucket:
1. Clique no bucket (`foto-perfil`)
2. Vá para a aba **Policies**
3. Clique em **New Policy**
4. Selecione **For full customization, use the Policy Editor**
5. Cole a seguinte policy (substitua `foto-perfil` pelo nome do bucket correspondente):

```sql
CREATE POLICY "Enable upload for authenticated users"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'foto-perfil' AND 
  (auth.role() = 'authenticated' OR auth.role() = 'anon')
);

CREATE POLICY "Enable delete for authenticated users"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'foto-perfil' AND 
  (auth.role() = 'authenticated' OR auth.role() = 'anon')
);

CREATE POLICY "Enable public read access"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'foto-perfil'
);
```

**Repita para o bucket `foto-capa-roteiro`**

## 3. Validar as credenciais no .env

Certifique-se que seu arquivo `.env` contém:
```
EXPO_PUBLIC_SUPABASE_URL=https://[seu-projeto].supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_[sua-chave]
```

## 4. Testar Upload

1. Reinicie o servidor Expo: `npm start`
2. No app, tente enviar uma foto de perfil ou capa de roteiro
3. Você deve ver a imagem armazenada no Supabase Storage

## Troubleshooting

### Erro: "Network request failed"
- Verifique se os buckets foram criados com **Privacy: Public**
- Confirme que as políticas foram adicionadas
- Tente fazer um rebuild completo: `npx expo prebuild --clean`

### Erro: "Bucket not found"
- Verifique o nome exato do bucket (case-sensitive: `foto-perfil`, não `Foto-Perfil`)
- Confirme que o bucket aparece em Storage > Buckets

### Imagem não aparece após upload
- Verifique a URL retornada está no formato correto
- Teste a URL diretamente no navegador

## Links úteis
- [Docs Supabase Storage](https://supabase.com/docs/guides/storage)
- [Supabase RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)
