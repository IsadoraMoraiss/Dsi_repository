import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../constants/Colors';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { RecentViewsProvider } from '../context/RecentViewsContext';
// Notificações agora são inicializadas sob demanda nos screens de agenda/checklist.

/** Thin wrapper to pass current uid down to RecentViewsProvider (which lives inside AuthProvider). */
function AuthAwareRecentViews({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return <RecentViewsProvider uid={user?.uid ?? null}>{children}</RecentViewsProvider>;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthAwareRecentViews>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: Colors.background },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="criar-roteiro" options={{ presentation: 'modal' }} />
          <Stack.Screen name="roteiro-detalhes" />
          <Stack.Screen name="detalhes-cidade" />
          <Stack.Screen name="city-details" />
          <Stack.Screen name="perfil/meu-perfil" />
          <Stack.Screen name="perfil/editar-perfil" />
          <Stack.Screen name="perfil/preferencias" />
          <Stack.Screen name="perfil/seja-guia" />
          <Stack.Screen name="perfil/avaliacoes" />
          <Stack.Screen name="perfil/roteiros-favoritos" />
          <Stack.Screen name="perfil/configuracoes" />
          <Stack.Screen name="guias" />
          {/* Rotas legadas mantidas temporariamente para compatibilidade */}
          <Stack.Screen name="home" />
          <Stack.Screen name="login" />
          <Stack.Screen name="cadastro" />
          <Stack.Screen name="redefinir" />
          <Stack.Screen name="verificacao" />
        </Stack>
      </AuthAwareRecentViews>
    </AuthProvider>
  );
}
