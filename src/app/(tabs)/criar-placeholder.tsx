/**
 * criar-placeholder.tsx
 *
 * Rota fictícia exigida pelo Tabs.Screen "criar-placeholder".
 * Nunca é renderizada como conteúdo — o botão "+" no centro da tab bar
 * navega diretamente para /criar-roteiro (modal Stack).
 * Este arquivo existe apenas para satisfazer o file-based router do expo-router.
 */
import { Redirect } from 'expo-router';

export default function CriarPlaceholder() {
  return <Redirect href="/criar-roteiro" />;
}
