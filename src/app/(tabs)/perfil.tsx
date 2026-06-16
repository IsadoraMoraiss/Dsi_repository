/**
 * (tabs)/perfil.tsx
 *
 * Tela principal da aba Perfil.
 * Arquivo único em (tabs)/ para que o Expo Router registre a rota como "perfil"
 * (e não como "perfil/index", que ocorre quando se usa uma pasta com index.tsx).
 */

import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { useResponsive } from '../../utils/responsive';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../services/firebase';
import { signOut } from 'firebase/auth';

type MenuItemProps = {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  onPress: () => void;
};

function MenuItem({ icon, label, onPress }: MenuItemProps) {
  const r = useResponsive();
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <MaterialIcons name={icon} size={r.scaleX(26)} color={Colors.textWhite} style={styles.menuIcon} />
      <Text style={[styles.menuLabel, { fontSize: r.font(18) }]}>{label}</Text>
      <MaterialIcons name="chevron-right" size={20} color="rgba(255,255,255,0.4)" />
    </TouchableOpacity>
  );
}

export default function PerfilScreen() {
  const router = useRouter();
  const r = useResponsive();
  const insets = useSafeAreaInsets();
  const { userData, loading } = useAuth();

  const handleLogout = async () => {
    try {
      if (auth) await signOut(auth);
      router.replace('/login');
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={[styles.header, { paddingTop: r.scaleY(8) }]}>
        <Text style={[styles.headerTitle, { fontSize: r.font(20) }]}>Perfil</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar + Nome */}
        <View style={styles.topRow}>
          <View style={styles.avatar}>
            {userData?.avatarUrl ? (
              <Image source={{ uri: userData.avatarUrl }} style={styles.avatarImage} />
            ) : (
              <MaterialIcons name="person" size={r.scaleX(48)} color={Colors.textWhite} />
            )}
          </View>
          <Text style={[styles.name, { fontSize: r.font(22) }]}>{userData?.nome || 'Usuário'}</Text>
        </View>

        <View style={styles.divider} />

        <MenuItem icon="person-outline" label="Meu Perfil" onPress={() => router.push('/perfil/meu-perfil')} />
        <MenuItem icon="bookmark-border" label="Meus Roteiros" onPress={() => router.push('/perfil/roteiros-favoritos')} />
        <MenuItem icon="star-border" label="Minhas Avaliações" onPress={() => router.push('/perfil/avaliacoes')} />
        <MenuItem icon="event" label="Minha Agenda" onPress={() => router.push('/agenda')} />
        <MenuItem icon="checklist" label="Checklist" onPress={() => router.push('/checklist')} />
        <MenuItem icon="auto-awesome" label="Preferências" onPress={() => router.push('/perfil/preferencias')} />

        <View style={styles.divider} />

        <MenuItem icon="logout" label="Sair da conta" onPress={handleLogout} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 12 },
  headerTitle: { color: Colors.textWhite, fontWeight: '700' },
  content: { paddingHorizontal: 28, paddingTop: 16 },
  topRow: { alignItems: 'flex-start', marginBottom: 20 },
  avatar: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: 'rgba(121,116,231,0.4)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.primary,
    overflow: 'hidden', marginBottom: 12,
  },
  avatarImage: { width: '100%', height: '100%' },
  name: { color: Colors.textWhite, fontWeight: '700' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.15)', marginVertical: 16 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18 },
  menuIcon: { marginRight: 16 },
  menuLabel: { color: Colors.textWhite, fontWeight: '500', flex: 1 },
});
