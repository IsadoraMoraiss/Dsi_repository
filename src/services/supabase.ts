import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    })
  : null;

function getSupabaseClient() {
  if (!supabase) {
    throw new Error('Supabase nao configurado.');
  }
  return supabase;
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  if (typeof globalThis.Buffer !== 'undefined') {
    const buffer = (globalThis.Buffer as any).from(base64, 'base64');
    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  }

  if (typeof atob === 'function') {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    return bytes.buffer;
  }

  throw new Error('Decodificacao base64 nao suportada.');
}

export async function uploadImageToSupabase(
  bucket: string,
  path: string,
  base64: string,
): Promise<string> {
  const client = getSupabaseClient();
  const { data, error } = await client.storage.from(bucket).upload(
    path,
    base64ToArrayBuffer(base64),
    { upsert: true, contentType: 'image/jpeg' },
  );

  if (error) throw new Error(`Falha no upload: ${error.message}`);

  const result = client.storage.from(bucket).getPublicUrl(data.path);
  if (!result.data.publicUrl) throw new Error('URL publica nao gerada.');
  return result.data.publicUrl;
}

export async function deleteSupabaseStorageFile(url: string): Promise<void> {
  if (!supabase || !url.includes('.supabase.co/storage/v1/object/public/')) return;

  const parsed = new URL(url);
  const match = parsed.pathname.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)/);
  if (!match) return;

  const [, bucket, path] = match;
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw new Error(`Falha ao excluir imagem: ${error.message}`);
}
