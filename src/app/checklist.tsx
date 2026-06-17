import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Calendar, DateData, LocaleConfig } from 'react-native-calendars';
import { Colors } from '../constants/Colors';
import { Radius, Shadow } from '../constants/Tokens';
import { useAuth } from '../context/AuthContext';
import {
  ChecklistItem,
  atualizarChecklist,
  criarChecklist,
  excluirChecklist,
  listarChecklists,
} from '../services/checklist';
import {
  agendarNotificacoesChecklist,
  cancelarNotificacoesChecklist,
  solicitarPermissaoNotificacoes,
} from '../services/notifications';
import { useResponsive } from '../utils/responsive';

/** Formata Date para YYYY-MM-DD */
function toISO(date: Date): string {
  return date.toISOString().split('T')[0];
}

/** Formata YYYY-MM-DD para DD/MM/YYYY */
function formatDisplay(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

// Configuração do calendário em português
LocaleConfig.locales['pt-br'] = {
  monthNames: [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ],
  monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
  dayNames: ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'],
  dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
  today: 'Hoje',
};
LocaleConfig.defaultLocale = 'pt-br';

export default function ChecklistScreen() {
  const router = useRouter();
  const r = useResponsive();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [titulo, setTitulo] = useState('');
  const [prazoSelecionado, setPrazoSelecionado] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Solicitar permissão ao montar
  useEffect(() => {
    solicitarPermissaoNotificacoes();
  }, []);


  const fetchItems = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      console.log("BUSCANDO CHECKLISTS DO USUÁRIO:", user.uid);

      const data = await listarChecklists(user.uid);

      console.log("CHECKLISTS ENCONTRADOS:", data);

      setItems(data);

    } catch (error) {
      console.log("ERRO AO CARREGAR CHECKLIST:", error);

      Alert.alert(
        'Erro',
        'Não foi possível carregar o checklist.'
      );
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(useCallback(() => { fetchItems(); }, [fetchItems]));

  // ─── Toggle ───────────────────────────────────────────────────────────────

  const handleToggle = async (item: ChecklistItem) => {
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, concluido: !item.concluido } : i));
    try {
      await atualizarChecklist(item.id, { concluido: !item.concluido });
      // Cancela notificações ao concluir
      if (!item.concluido) {
        await cancelarNotificacoesChecklist(item.id);
      }
    } catch {
      fetchItems();
    }
  };

  // ─── Delete ───────────────────────────────────────────────────────────────

  const handleDelete = (id: string) => {
    Alert.alert('Excluir', 'Tem certeza que deseja excluir esta tarefa?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            setItems(prev => prev.filter(i => i.id !== id));
            await cancelarNotificacoesChecklist(id);
            await excluirChecklist(id);
          } catch {
            fetchItems();
          }
        },
      },
    ]);
  };

  // ─── Modal ────────────────────────────────────────────────────────────────

  const openModal = (item?: ChecklistItem) => {
    if (item) {
      setEditingId(item.id);
      setTitulo(item.titulo);
      setPrazoSelecionado(item.prazo || '');
    } else {
      setEditingId(null);
      setTitulo('');
      setPrazoSelecionado('');
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    Keyboard.dismiss();
    setModalVisible(false);
    setShowDatePicker(false);
    setEditingId(null);
    setTitulo('');
    setPrazoSelecionado('');
  };

  const onDayPress = (day: DateData) => {
    setPrazoSelecionado(day.dateString);
    setShowDatePicker(false);
  };

  // ─── Save ─────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!user) return;
    if (!titulo.trim()) {
      Alert.alert('Atenção', 'O título é obrigatório.');
      return;
    }
    if (!prazoSelecionado) {
      Alert.alert('Atenção', 'A data de prazo é obrigatória.');
      return;
    }

    const prazoISO = prazoSelecionado;
    setIsSaving(true);

    try {
      if (editingId) {
        await atualizarChecklist(editingId, { titulo: titulo.trim(), prazo: prazoISO });
        // Reagendar notificações se prazo foi alterado
        await cancelarNotificacoesChecklist(editingId);
        await agendarNotificacoesChecklist(editingId, titulo.trim(), prazoISO);
      } else {
        const created = await criarChecklist(user.uid, titulo.trim(), prazoISO);
        await agendarNotificacoesChecklist(created.id, titulo.trim(), prazoISO);
      }
      await fetchItems();
      closeModal();
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar a tarefa.');
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  const renderItem = ({ item }: { item: ChecklistItem }) => {
    const vencido = item.prazo && !item.concluido && item.prazo < toISO(new Date());
    return (
      <View style={styles.itemCard}>
        <TouchableOpacity style={styles.checkbox} onPress={() => handleToggle(item)}>
          <MaterialIcons
            name={item.concluido ? 'check-circle' : 'radio-button-unchecked'}
            size={28}
            color={item.concluido ? Colors.success : Colors.textGray}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.itemContent} onPress={() => openModal(item)} activeOpacity={0.7}>
          <Text style={[styles.itemTitle, { fontSize: r.font(15) }, item.concluido && styles.itemTitleCompleted]}>
            {item.titulo}
          </Text>
          {item.prazo ? (
            <View style={styles.prazoRow}>
              <MaterialIcons
                name="event"
                size={13}
                color={vencido ? Colors.danger : Colors.textGray}
              />
              <Text style={[styles.itemPrazo, { fontSize: r.font(12), color: vencido ? Colors.danger : Colors.textGray }]}>
                {vencido ? 'Vencido: ' : 'Prazo: '}{formatDisplay(item.prazo)}
              </Text>
            </View>
          ) : null}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item.id)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <MaterialIcons name="delete-outline" size={22} color={Colors.danger} />
        </TouchableOpacity>
      </View>
    );
  };

  const concluidoCount = items.filter(i => i.concluido).length;
  const progressPercent = items.length > 0 ? (concluidoCount / items.length) * 100 : 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.textWhite} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { fontSize: r.font(20) }]}>Checklist de Viagem</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* PROGRESSO */}
      <View style={styles.progressContainer}>
        <View style={styles.progressLabelRow}>
          <Text style={[styles.progressText, { fontSize: r.font(14) }]}>
            {concluidoCount} de {items.length} itens concluídos
          </Text>
          {items.length > 0 && (
            <Text style={[styles.progressPercent, { fontSize: r.font(14) }]}>
              {Math.round(progressPercent)}%
            </Text>
          )}
        </View>
        <View style={styles.progressBarTrack}>
          <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
        </View>
      </View>

      {/* LISTA */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : items.length === 0 ? (
        <View style={styles.center}>
          <MaterialIcons name="checklist" size={64} color="rgba(255,255,255,0.2)" />
          <Text style={[styles.emptyText, { fontSize: r.font(16) }]}>Nenhuma tarefa ainda.</Text>
          <Text style={[styles.emptySubText, { fontSize: r.font(13) }]}>
            Toque no + para adicionar
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 100 }]}
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={[styles.fab, { bottom: insets.bottom + 24 }]} onPress={() => openModal()}>
        <MaterialIcons name="add" size={32} color="#FFF" />
      </TouchableOpacity>

      {/* MODAL CRIAR/EDITAR (bottom sheet) */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={closeModal} />

          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 8 }]}>
            <View style={styles.modalHandle} />

            <Text style={[styles.modalTitle, { fontSize: r.font(18) }]}>
              {editingId ? 'Editar Tarefa' : 'Nova Tarefa'}
            </Text>

            {/* Título */}
            <Text style={styles.inputLabel}>Título *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Comprar protetor solar"
              placeholderTextColor="rgba(18,13,38,0.4)"
              value={titulo}
              onChangeText={setTitulo}
              autoFocus
            />

            {/* Prazo — DatePicker */}
            <Text style={styles.inputLabel}>Prazo *</Text>
            <TouchableOpacity
              style={styles.datePickerBtn}
              onPress={() => setShowDatePicker(!showDatePicker)}
              activeOpacity={0.8}
            >
              <MaterialIcons name="event" size={20} color={prazoSelecionado ? Colors.primary : Colors.textGray} />
              <Text style={[styles.datePickerText, !prazoSelecionado && styles.datePickerPlaceholder, { fontSize: r.font(15) }]}>
                {prazoSelecionado ? formatDisplay(prazoSelecionado) : 'Selecionar data obrigatória'}
              </Text>
              {prazoSelecionado ? (
                <TouchableOpacity
                  onPress={() => { setPrazoSelecionado(''); setShowDatePicker(true); }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <MaterialIcons name="close" size={18} color={Colors.textGray} />
                </TouchableOpacity>
              ) : (
                <MaterialIcons name={showDatePicker ? "expand-less" : "expand-more"} size={20} color={Colors.textGray} />
              )}
            </TouchableOpacity>

            {/* Calendário visual */}
            {showDatePicker && (
              <Calendar
                current={prazoSelecionado || toISO(new Date())}
                minDate={toISO(new Date())}
                onDayPress={onDayPress}
                markedDates={
                  prazoSelecionado
                    ? { [prazoSelecionado]: { selected: true, selectedColor: Colors.primary } }
                    : {}
                }
                theme={{
                  calendarBackground: '#FAFAFA',
                  textSectionTitleColor: Colors.textGray,
                  selectedDayBackgroundColor: Colors.primary,
                  selectedDayTextColor: '#ffffff',
                  todayTextColor: Colors.primary,
                  dayTextColor: Colors.textDark,
                  textDisabledColor: '#d9e1e8',
                  arrowColor: Colors.primary,
                  monthTextColor: Colors.textDark,
                  textMonthFontWeight: 'bold',
                }}
                style={styles.calendarStyle}
              />
            )}

            {prazoSelecionado ? (
              <View style={styles.notifInfo}>
                <MaterialIcons name="notifications-active" size={14} color={Colors.primary} />
                <Text style={[styles.notifInfoText, { fontSize: r.font(12) }]}>
                  Notificações: 3 dias antes, 1 dia antes e no dia do vencimento
                </Text>
              </View>
            ) : null}

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalBtnCancel} onPress={closeModal}>
                <Text style={styles.modalBtnCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtnSave, isSaving && { opacity: 0.7 }]}
                onPress={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.modalBtnSaveText}>Salvar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: { padding: 8 },
  headerTitle: { color: Colors.textWhite, fontWeight: '700' },

  // Progresso
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressText: { color: Colors.textWhite, fontWeight: '600' },
  progressPercent: { color: Colors.primary, fontWeight: '700' },
  progressBarTrack: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: { height: '100%', backgroundColor: Colors.success, borderRadius: 4 },

  // Listas
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
  emptyText: { color: 'rgba(255,255,255,0.5)', fontWeight: '600' },
  emptySubText: { color: 'rgba(255,255,255,0.3)' },
  listContent: { padding: 16 },

  // Item card
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: Radius.md,
    marginBottom: 10,
    ...Shadow.subtle,
  },
  checkbox: { marginRight: 12 },
  itemContent: { flex: 1 },
  itemTitle: { color: Colors.textDark, fontWeight: '600' },
  itemTitleCompleted: { textDecorationLine: 'line-through', color: Colors.textGray },
  prazoRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  itemPrazo: { color: Colors.textGray },
  deleteButton: { padding: 4 },

  // FAB
  fab: {
    position: 'absolute',
    right: 24,
    backgroundColor: Colors.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.button,
  },

  // Modal bottom sheet
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingTop: 12,
    ...Shadow.modal,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.15)',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: { color: Colors.textDark, fontWeight: '700', marginBottom: 14 },
  inputLabel: {
    color: Colors.textGray,
    fontWeight: '600',
    fontSize: 12,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    borderRadius: Radius.md,
    padding: 12,
    marginBottom: 16,
    color: Colors.textDark,
    fontSize: 15,
    backgroundColor: '#FAFAFA',
  },

  // Date picker button
  datePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    borderRadius: Radius.md,
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#FAFAFA',
  },
  datePickerText: { flex: 1, color: Colors.textDark, fontWeight: '500' },
  datePickerPlaceholder: { color: 'rgba(18,13,38,0.35)', fontWeight: '400' },

  // Aviso de notificação
  notifInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(121,116,231,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.sm,
    marginBottom: 16,
  },
  notifInfoText: { color: Colors.primary, fontWeight: '500', flex: 1 },
  calendarStyle: {
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    marginBottom: 16,
  },

  // Ações
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 8 },
  modalBtnCancel: { paddingVertical: 12, paddingHorizontal: 16, justifyContent: 'center' },
  modalBtnCancelText: { color: Colors.textGray, fontWeight: '600', fontSize: 15 },
  modalBtnSave: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: Radius.md,
    minWidth: 100,
    alignItems: 'center',
  },
  modalBtnSaveText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
});
