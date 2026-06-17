import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { getAllCidadesDataset } from '../data/cidadesDataset';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
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
  AgendaItem,
  atualizarAgenda,
  criarAgenda,
  excluirAgenda,
  listarAgendas,
} from '../services/agenda';
import {
  agendarNotificacoesAgenda,
  cancelarNotificacoesAgenda,
  solicitarPermissaoNotificacoes,
} from '../services/notifications';
import { useResponsive } from '../utils/responsive';

// Configuração do calendário em português
LocaleConfig.locales['pt-br'] = {
  monthNames: [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ],
  monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
  dayNames: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
  dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
  today: 'Hoje',
};
LocaleConfig.defaultLocale = 'pt-br';

/** Formata YYYY-MM-DD para DD/MM/YYYY */
function formatDateDisplay(iso: string): string {
  const [year, month, day] = iso.split('-');
  return `${day}/${month}/${year}`;
}

/** Retorna a data de hoje no formato YYYY-MM-DD usando horário LOCAL */
function todayISO(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function AgendaScreen() {
  const router = useRouter();
  const r = useResponsive();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [items, setItems] = useState<AgendaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(todayISO());

  // Solicitar permissão ao montar
  useEffect(() => {
    solicitarPermissaoNotificacoes();
  }, []);

  // Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [horario, setHorario] = useState('');
  const [local, setLocal] = useState('');
  const [descricao, setDescricao] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [buscaCidade, setBuscaCidade] = useState('');
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);

  // ─── Fetch ──────────────────────────────────────────────────────────────────

  const fetchItems = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    try {
      console.log('[AgendaScreen] Buscando itens para userId:', user.uid);
      const result = await listarAgendas(user.uid);
      console.log('[AgendaScreen] Total de itens recebidos:', result.length);
      result.forEach(item => console.log('[AgendaScreen] item.data =', item.data, '| id =', item.id));
      setItems(result);
    } catch (err) {
      console.log('[AgendaScreen] Erro ao buscar agendas:', err);
      Alert.alert('Erro', 'Não foi possível carregar a agenda.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // ─── useFocusEffect ──────────────────────────────────────────────────────────

  useFocusEffect(useCallback(() => { fetchItems(); }, [fetchItems]));

  // ─── Datas com eventos (marcadas no calendário) ───────────────────────────

  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};
    items.forEach(item => {
      marks[item.data] = {
        marked: true,
        dotColor: Colors.primary,
        ...(item.data === selectedDate && {
          selected: true,
          selectedColor: Colors.primary,
        }),
      };
    });
    // Garante que a data selecionada sempre apareça destacada
    if (!marks[selectedDate]) {
      marks[selectedDate] = { selected: true, selectedColor: Colors.primary };
    } else {
      marks[selectedDate] = { ...marks[selectedDate], selected: true, selectedColor: Colors.primary };
    }
    return marks;
  }, [items, selectedDate]);

  // ─── Eventos do dia selecionado ──────────────────────────────────────────

  const eventosDoDia = useMemo(() => {
    console.log('[AgendaScreen] selectedDate:', selectedDate, '| total items:', items.length);
    const filtered = items
      .filter(i => i.data === selectedDate)
      .sort((a, b) => a.horario.localeCompare(b.horario));
    console.log('[AgendaScreen] eventosDoDia count:', filtered.length);
    return filtered;
  }, [items, selectedDate]);

  // ─── CRUD ────────────────────────────────────────────────────────────────

  const handleDelete = (id: string) => {
    Alert.alert('Excluir', 'Tem certeza que deseja excluir este evento?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            setItems(prev => prev.filter(i => i.id !== id));
            await cancelarNotificacoesAgenda(id);
            await excluirAgenda(id);
          } catch {
            fetchItems();
          }
        },
      },
    ]);
  };

  const openModal = (item?: AgendaItem) => {
    if (item) {
      setEditingId(item.id);
      setHorario(item.horario);
      setLocal(item.local);
      setBuscaCidade(item.local);
      setDescricao(item.descricao);
    }
    else {
      setEditingId(null);
      setHorario('');
      setLocal('');
      setDescricao('');
      setBuscaCidade('');
      setMostrarSugestoes(false);
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    Keyboard.dismiss();
    setModalVisible(false);
    setEditingId(null);
    setHorario('');
    setLocal('');
    setDescricao('');
    setBuscaCidade('');
    setMostrarSugestoes(false);
  };

  const handleSave = async () => {
    if (!user) return;
    if (!local.trim()) {
      Alert.alert('Atenção', 'Selecione uma cidade da lista.');
      return;
    }
    if (!horario.trim() || !local.trim()) {
      Alert.alert('Atenção', 'Horário e local são obrigatórios.');
      return;
    }
    const [hora, minuto] = horario.split(':');

    const horaNum = Number(hora);
    const minutoNum = Number(minuto);

    if (
      horario.length !== 5 ||
      isNaN(horaNum) ||
      isNaN(minutoNum) ||
      horaNum < 0 ||
      horaNum > 23 ||
      minutoNum < 0 ||
      minutoNum > 59
    ) {
      Alert.alert(
        'Horário inválido',
        'Digite um horário válido no formato HH:MM'
      );
      return;
    }
    setIsSaving(true);
    try {
      if (editingId) {
        await atualizarAgenda(editingId, {
          horario: horario.trim(),
          local: local.trim(),
          descricao: descricao.trim(),
        });
        // Reagendar notificações com os novos dados
        await cancelarNotificacoesAgenda(editingId);
        await agendarNotificacoesAgenda(editingId, local.trim(), selectedDate, horario.trim());
      } else {
        const created = await criarAgenda(user.uid, selectedDate, horario.trim(), local.trim(), descricao.trim());
        await agendarNotificacoesAgenda(created.id, local.trim(), selectedDate, horario.trim());
      }
      await fetchItems();
      closeModal();
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar o evento.');
    } finally {
      setIsSaving(false);
    }
  };
  const cidades = getAllCidadesDataset();
  const cidadesFiltradas = cidades
    .filter((c) =>
      `${c.nome} ${c.estado}`
        .toLowerCase()
        .includes(buscaCidade.toLowerCase())
    )
    .slice(0, 10);
  const renderEvento = ({ item }: { item: AgendaItem }) => (
    <TouchableOpacity style={styles.itemCard} onPress={() => openModal(item)} activeOpacity={0.85}>
      <View style={styles.timeBox}>
        <Text style={[styles.timeText, { fontSize: r.font(15) }]}>{item.horario}</Text>
      </View>
      <View style={styles.itemContent}>
        <Text style={[styles.itemLocal, { fontSize: r.font(15) }]}>{item.local}</Text>
        {item.descricao ? (
          <Text style={[styles.itemDesc, { fontSize: r.font(13) }]}>{item.descricao}</Text>
        ) : null}
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDelete(item.id)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <MaterialIcons name="delete-outline" size={22} color={Colors.danger} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.textWhite} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { fontSize: r.font(20) }]}>Agenda da Viagem</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* CALENDÁRIO */}
        <Calendar
          current={selectedDate}
          onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
          markedDates={markedDates}
          theme={{
            backgroundColor: 'transparent',
            calendarBackground: 'rgba(255,255,255,0.07)',
            textSectionTitleColor: 'rgba(255,255,255,0.6)',
            selectedDayBackgroundColor: Colors.primary,
            selectedDayTextColor: '#FFFFFF',
            todayTextColor: Colors.primary,
            dayTextColor: '#FFFFFF',
            textDisabledColor: 'rgba(255,255,255,0.2)',
            dotColor: Colors.primary,
            selectedDotColor: '#FFFFFF',
            arrowColor: Colors.primary,
            monthTextColor: '#FFFFFF',
            indicatorColor: Colors.primary,
            textDayFontWeight: '500',
            textMonthFontWeight: '700',
            textDayHeaderFontWeight: '600',
          }}
          style={styles.calendar}
        />

        {/* CABEÇALHO DA SEÇÃO DE EVENTOS */}
        <View style={styles.dayHeader}>
          <View style={styles.dayHeaderLeft}>
            <MaterialIcons name="event" size={20} color={Colors.primary} />
            <Text style={[styles.dayTitle, { fontSize: r.font(16) }]}>
              {formatDateDisplay(selectedDate)}
            </Text>
          </View>
          <TouchableOpacity style={styles.addDayBtn} onPress={() => openModal()}>
            <MaterialIcons name="add" size={20} color="#FFF" />
            <Text style={[styles.addDayBtnText, { fontSize: r.font(13) }]}>Adicionar</Text>
          </TouchableOpacity>
        </View>

        {/* EVENTOS DO DIA */}
        {loading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 32 }} />
        ) : eventosDoDia.length === 0 ? (
          <View style={styles.emptyDay}>
            <MaterialIcons name="event-busy" size={40} color="rgba(255,255,255,0.3)" />
            <Text style={[styles.emptyDayText, { fontSize: r.font(14) }]}>
              Nenhum evento neste dia.
            </Text>
          </View>
        ) : (
          <View style={styles.eventList}>
            {eventosDoDia.map(item => (
              <View key={item.id}>{renderEvento({ item })}</View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* MODAL CRIAR/EDITAR */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={closeModal} />
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 8 }]}>
            {/* Handle bar */}
            <View style={styles.modalHandle} />

            <Text style={[styles.modalTitle, { fontSize: r.font(18) }]}>
              {editingId ? 'Editar Evento' : 'Novo Evento'}
            </Text>

            {/* Data selecionada (somente leitura no modal) */}
            <View style={styles.selectedDateChip}>
              <MaterialIcons name="calendar-today" size={16} color={Colors.primary} />
              <Text style={[styles.selectedDateText, { fontSize: r.font(14) }]}>
                {formatDateDisplay(selectedDate)}
              </Text>
            </View>

            {/* Horário */}
            <Text style={styles.inputLabel}>Horário *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 09:00"
              placeholderTextColor="rgba(18,13,38,0.4)"
              value={horario}
              onChangeText={text => {
                // Mascara simples HH:MM
                const nums = text.replace(/\D/g, '').slice(0, 4);
                if (nums.length <= 2) setHorario(nums);
                else setHorario(`${nums.slice(0, 2)}:${nums.slice(2)}`);
              }}
              keyboardType="numeric"
              maxLength={5}
            />

            {/* Cidade */}
            <Text style={styles.inputLabel}>Cidade *</Text>

            <TextInput
              style={styles.input}
              placeholder="Digite uma cidade"
              placeholderTextColor="rgba(18,13,38,0.4)"
              value={buscaCidade}
              onChangeText={(text) => {
                setBuscaCidade(text);
                setLocal('');
                setMostrarSugestoes(true);
              }}
            />

            {mostrarSugestoes && buscaCidade.length > 1 && (
              <ScrollView
                style={{
                  maxHeight: 180,
                  backgroundColor: '#FFF',
                  borderRadius: 8,
                  marginBottom: 12,
                }}
                nestedScrollEnabled
              >
                {cidadesFiltradas.map((cidade) => (
                  <TouchableOpacity
                    key={cidade.id}
                    style={{
                      padding: 12,
                      borderBottomWidth: 1,
                      borderBottomColor: '#EEE',
                    }}
                    onPress={() => {
                      const cidadeSelecionada =
                        `${cidade.nome} - ${cidade.estado}`;

                      setLocal(cidadeSelecionada);
                      setBuscaCidade(cidadeSelecionada);
                      setMostrarSugestoes(false);
                    }}
                  >
                    <Text>
                      {cidade.nome} - {cidade.estado}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {/* Descrição */}
            <Text style={styles.inputLabel}>Descrição</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              placeholder="Detalhes do evento (opcional)"
              placeholderTextColor="rgba(18,13,38,0.4)"
              multiline
              numberOfLines={3}
              value={descricao}
              onChangeText={setDescricao}
            />

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

  // Calendário
  calendar: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },

  // Cabeçalho do dia selecionado
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
  },
  dayHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dayTitle: { color: Colors.textWhite, fontWeight: '700' },
  addDayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radius.round,
  },
  addDayBtnText: { color: '#FFF', fontWeight: '600' },

  // Lista de eventos
  eventList: { paddingHorizontal: 16 },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: Radius.md,
    marginBottom: 10,
    ...Shadow.subtle,
  },
  timeBox: {
    width: 52,
    alignItems: 'center',
    marginRight: 12,
    paddingTop: 1,
  },
  timeText: { color: Colors.primary, fontWeight: '700' },
  itemContent: { flex: 1 },
  itemLocal: { color: Colors.textDark, fontWeight: '600' },
  itemDesc: { color: Colors.textGray, marginTop: 4, lineHeight: 18 },
  deleteButton: { padding: 4 },

  // Empty state
  emptyDay: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  emptyDayText: { color: 'rgba(255,255,255,0.4)', textAlign: 'center' },

  // Modal (bottom sheet)
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
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
  modalTitle: { color: Colors.textDark, fontWeight: '700', marginBottom: 12 },
  selectedDateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(121,116,231,0.12)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.round,
    marginBottom: 16,
  },
  selectedDateText: { color: Colors.primary, fontWeight: '600' },
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
    marginBottom: 14,
    color: Colors.textDark,
    fontSize: 15,
    backgroundColor: '#FAFAFA',
  },
  inputMultiline: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 4 },
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
