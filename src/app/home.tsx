import { StyleSheet, Text, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { Colors } from '../constants/Colors';
import { MaterialIcons } from '@expo/vector-icons';
import { Typography } from '../constants/Typography';

/**
 * Tela Home - Protegida, apenas para usuários autenticados
 */
export default function HomeScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.appNameBox}>
            <MaterialIcons
              name="location-pin"
              size={40}
              color={Colors.primary}
              style={styles.icon}
            />
            <View>
              <Text style={styles.appNameBrasil}>BRASIL</Text>
              <Text style={styles.appNameFoco}>em foco</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Conteúdo Principal */}
      <View style={styles.content}>
        <View style={styles.welcomeBox}>
          <MaterialIcons
            name="check-circle"
            size={64}
            color={Colors.primary}
            style={styles.welcomeIcon}
          />
          <Text style={styles.welcomeTitle}>Bem-vindo!</Text>
          <Text style={styles.welcomeSubtitle}>
            {user?.nome || 'Usuário'}
          </Text>
        </View>

        <View style={styles.infoBox}>
          <View style={styles.infoItem}>
            <MaterialIcons
              name="mail"
              size={24}
              color={Colors.primary}
              style={styles.infoIcon}
            />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>E-mail</Text>
              <Text style={styles.infoValue}>{user?.email}</Text>
            </View>
          </View>
        </View>

        <View style={styles.placeholder}>
          <MaterialIcons
            name="explore"
            size={64}
            color={Colors.primary}
            style={styles.placeholderIcon}
          />
          <Text style={styles.placeholderText}>
            Conteúdo principal da app em desenvolvimento
          </Text>
        </View>
      </View>

      {/* Botão Logout */}
      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && styles.logoutButtonPressed,
          ]}
          onPress={handleLogout}
        >
          <MaterialIcons
            name="logout"
            size={20}
            color={Colors.textWhite}
            style={styles.logoutIcon}
          />
          <Text style={styles.logoutButtonText}>Sair</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appNameBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  icon: {
    marginRight: 4,
  },
  appNameBrasil: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 1,
  },
  appNameFoco: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textWhite,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  welcomeBox: {
    alignItems: 'center',
    marginBottom: 40,
    paddingVertical: 32,
  },
  welcomeIcon: {
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textWhite,
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: Colors.textGray,
  },
  infoBox: {
    backgroundColor: '#1E1E2E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoIcon: {
    marginRight: 8,
  },
  infoText: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.textGray,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: Colors.textWhite,
    fontWeight: '500',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E1E2E',
    borderRadius: 12,
    padding: 24,
  },
  placeholderIcon: {
    marginBottom: 16,
    opacity: 0.6,
  },
  placeholderText: {
    fontSize: 14,
    color: Colors.textGray,
    textAlign: 'center',
  },
  footer: {
    padding: 16,
    paddingBottom: 24,
  },
  logoutButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
  },
  logoutButtonPressed: {
    opacity: 0.8,
  },
  logoutIcon: {
    marginRight: 4,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textWhite,
  },
});
