import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import BottomNav, { NavKey } from '../home/BottomNav';

type MainTabLayoutProps = {
  children: React.ReactNode;
  activeTab: NavKey;
};

export default function MainTabLayout({ children, activeTab }: MainTabLayoutProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  function handleChangeTab(key: NavKey) {
    if (key === activeTab) return;
    if (key === 'explorar') router.replace('/home');
    else if (key === 'roteiro') router.replace('/roteiros');
    else if (key === 'mapa') router.replace('/mapa');
    else if (key === 'perfil') router.replace('/perfil');
  }

  function handlePressCenter() {
    router.push('/criar-roteiro');
  }

  return (
    <View style={styles.root}>
      <View style={styles.content}>{children}</View>
      <BottomNav
        activeKey={activeTab}
        onChange={handleChangeTab}
        bottomInset={insets.bottom}
        onPressCenter={handlePressCenter}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1 },
});
