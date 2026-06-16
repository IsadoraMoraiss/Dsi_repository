import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  if (typeof globalThis.Buffer !== 'undefined') {
    return (globalThis.Buffer as any).from(base64, 'base64').buffer;
  }

  if (typeof atob === 'function') {
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  throw new Error('Base64 decoding não suportado no ambiente atual.');
}

export function parseSupabasePublicUrl(url: string): { bucket: string; path: string } | null {
  try {
    const parsedUrl = new URL(url);
    const match = parsedUrl.pathname.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)/);
    if (!match) return null;
    return { bucket: match[1], path: match[2] };
  } catch {
    return null;
  }
}

export async function uploadImageToSupabaseBucket(
  bucket: string,
  path: string,
  base64: string,
): Promise<string> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase não está configurado. Adicione EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY no .env.');
  }

  if (!base64) {
    throw new Error('Base64 da imagem não fornecido para upload.');
  }

  const arrayBuffer = base64ToArrayBuffer(base64);
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, arrayBuffer, { upsert: true, contentType: 'image/jpeg' });

  if (error) {
    throw new Error(`Falha ao enviar arquivo para Supabase: ${error.message}`);
  }

  const publicUrl = supabase.storage.from(bucket).getPublicUrl(data.path);
  if (!publicUrl.data?.publicUrl) {
    throw new Error('Não foi possível obter a URL pública do arquivo enviado.');
  }

  return publicUrl.data.publicUrl;
}

export async function deleteSupabaseStorageFile(url: string): Promise<void> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase não está configurado. Adicione EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY no .env.');
  }

  const parsed = parseSupabasePublicUrl(url);
  if (!parsed) {
    throw new Error('URL Supabase inválida para exclusão de arquivo.');
  }

  const { data, error } = await supabase.storage.from(parsed.bucket).remove([parsed.path]);
  if (error) {
    throw new Error(`Falha ao excluir arquivo do Supabase: ${error.message}`);
  }
}
