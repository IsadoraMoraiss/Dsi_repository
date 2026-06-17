/**
 * (tabs)/_layout.tsx
 *
 * Layout principal das abas usando o Tab Navigator nativo do expo-router.
 * Centraliza a navegação mobile do app com transições nativas.
 *
 * O botão central "+" não ocupa uma aba real — ao ser pressionado navega
 * para a tela de criar roteiro como modal (Stack), mantendo a lógica de
 * negócio separada da navegação por abas.
 */

import { MaterialIcons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';

/** Ícone utilizado pela tab bar nativa */
function TabIcon({
  name,
  color,
  size = 24,
}: {
  name: keyof typeof MaterialIcons.glyphMap;
  color: string;
  size?: number;
}) {
  return <MaterialIcons name={name} size={size} color={color} />;
}

/** Botão central flutuante que dispara a criação de roteiro como modal */
function CenterCreateButton() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.centerBtnWrapper, { bottom: insets.bottom + 6 }]}>
      <Pressable
        style={({ pressed }) => [styles.centerBtn, pressed && styles.centerBtnPressed]}
        onPress={() => router.push('/criar-roteiro')}
        accessibilityLabel="Criar novo roteiro"
        accessibilityRole="button"
      >
        <MaterialIcons name="add" size={28} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

export default function TabLayout() {
  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.textGray,
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabLabel,
          tabBarItemStyle: styles.tabItem,
          animation: 'shift',
        }}
      >
        <Tabs.Screen
          name="explorar"
          options={{
            title: 'Explorar',
            tabBarIcon: ({ color, size }) => (
              <TabIcon name="explore" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="roteiros"
          options={{
            title: 'Roteiros',
            tabBarIcon: ({ color, size }) => (
              <TabIcon name="calendar-today" color={color} size={size} />
            ),
          }}
        />
        {/* Aba vazia no centro — espaço para o botão flutuante */}
        <Tabs.Screen
          name="criar-placeholder"
          options={{
            title: '',
            tabBarIcon: () => <View />,
            tabBarButton: () => <View style={styles.centerPlaceholder} />,
          }}
        />
        <Tabs.Screen
          name="mapa"
          options={{
            title: 'Mapa',
            tabBarIcon: ({ color, size }) => (
              <TabIcon name="place" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="perfil"
          options={{
            title: 'Perfil',
            tabBarIcon: ({ color, size }) => (
              <TabIcon name="person" color={color} size={size} />
            ),
          }}
        />
      </Tabs>

      {/* Botão "+" sobreposto à tab bar — fora da árvore de Tabs para flutuar acima */}
      <CenterCreateButton />
    </>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.inputBackground,
    borderTopWidth: 1,
    borderTopColor: Colors.inputBorder,
    height: Platform.select({ ios: 80, android: 64, web: 64 }),
    paddingBottom: Platform.select({ ios: 0, android: 8, web: 0 }),
    // Sombra nativa (sem web-like box-shadow)
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 8 },
    }),
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: Platform.select({ ios: 4, android: 0, web: 0 }),
  },
  tabItem: {
    paddingTop: 6,
  },
  centerPlaceholder: {
    flex: 1,
  },
  centerBtnWrapper: {
    position: 'absolute',
    alignSelf: 'center',
    left: '50%',
    transform: [{ translateX: -28 }],
    zIndex: 10,
  },
  centerBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
      },
      android: { elevation: 8 },
    }),
  },
  centerBtnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.95 }],
  },
});
