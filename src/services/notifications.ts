/**
 * services/notifications.ts
 *
 * Serviço centralizado para notificações locais com Expo Notifications.
 * Compatível com Android e iOS, funciona mesmo com app fechado.
 */
import { Platform } from 'react-native';

let Notifications: typeof import('expo-notifications') | null = null;

async function getNotifications() {
  if (Notifications) return Notifications;
  Notifications = await import('expo-notifications');
  return Notifications;
}

// ─── Configuração Global ────────────────────────────────────────────────────

/**
 * Configura o handler de notificações (como exibir quando o app está aberto).
 * Deve ser chamado uma única vez quando o app precisar mostrar notificações.
 */
export async function configurarHandlerNotificacoes() {
  const Notifications = await getNotifications();
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

/**
 * Solicita permissão de notificação ao usuário.
 * Retorna true se concedida.
 */
export async function solicitarPermissaoNotificacoes(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  const Notifications = await getNotifications();
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return false;

  // Canal Android (obrigatório para Android 8+)
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Brasil em Foco',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#7974E7',
      sound: 'default',
    });
  }

  return true;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Agenda uma notificação para uma data específica (só agenda se for futura). */
async function agendarNotificacao(
  titulo: string,
  corpo: string,
  data: Date,
  identificador: string
): Promise<string | null> {
  if (data <= new Date()) return null; // Data já passou, não agenda

  try {
    const Notifications = await getNotifications();
    const id = await Notifications.scheduleNotificationAsync({
      identifier: identificador,
      content: {
        title: titulo,
        body: corpo,
        sound: 'default',
        data: {},
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: data,
      },
    });
    return id;
  } catch (e) {
    console.warn('[notifications] Erro ao agendar:', e);
    return null;
  }
}

/** Cancela notificações por identificador(es). */
export async function cancelarNotificacoes(ids: string[]): Promise<void> {
  const Notifications = await getNotifications();
  for (const id of ids) {
    try {
      await Notifications.cancelScheduledNotificationAsync(id);
    } catch {
      // Ignora silenciosamente se a notificação não existir
    }
  }
}

// ─── Checklist ───────────────────────────────────────────────────────────────

/**
 * Agenda 3 notificações para um item do checklist:
 * - 3 dias antes do prazo
 * - 1 dia antes do prazo
 * - No dia do vencimento (08:00)
 *
 * Retorna os IDs das notificações agendadas.
 */
export async function agendarNotificacoesChecklist(
  itemId: string,
  titulo: string,
  prazoISO: string // formato YYYY-MM-DD
): Promise<string[]> {
  const prazoBase = new Date(prazoISO + 'T08:00:00');
  if (isNaN(prazoBase.getTime())) return [];

  const ids: string[] = [];

  const tres = new Date(prazoBase);
  tres.setDate(tres.getDate() - 3);
  const id3 = await agendarNotificacao(
    '⏳ Checklist de Viagem',
    `"${titulo}" vence em 3 dias! Não esqueça.`,
    tres,
    `checklist-${itemId}-3d`
  );
  if (id3) ids.push(id3);

  const um = new Date(prazoBase);
  um.setDate(um.getDate() - 1);
  const id1 = await agendarNotificacao(
    '⚠️ Checklist de Viagem',
    `"${titulo}" vence amanhã!`,
    um,
    `checklist-${itemId}-1d`
  );
  if (id1) ids.push(id1);

  const idVenc = await agendarNotificacao(
    '🔴 Prazo hoje!',
    `"${titulo}" vence hoje. Marque como concluído!`,
    prazoBase,
    `checklist-${itemId}-hoje`
  );
  if (idVenc) ids.push(idVenc);

  return ids;
}

/** Cancela todas as notificações de um item do checklist. */
export async function cancelarNotificacoesChecklist(itemId: string): Promise<void> {
  await cancelarNotificacoes([
    `checklist-${itemId}-3d`,
    `checklist-${itemId}-1d`,
    `checklist-${itemId}-hoje`,
  ]);
}

// ─── Agenda ──────────────────────────────────────────────────────────────────

/**
 * Agenda 3 notificações para um evento da agenda:
 * - 1 dia antes (08:00)
 * - 2 horas antes do horário do evento
 * - 30 minutos antes do horário do evento
 *
 * Retorna os IDs das notificações agendadas.
 */
export async function agendarNotificacoesAgenda(
  itemId: string,
  local: string,
  dataISO: string,   // formato YYYY-MM-DD
  horario: string    // formato HH:MM
): Promise<string[]> {
  const [hh, mm] = horario.split(':').map(Number);
  if (isNaN(hh) || isNaN(mm)) return [];

  const eventoData = new Date(`${dataISO}T${horario.padEnd(5, ':00')}:00`);
  if (isNaN(eventoData.getTime())) return [];

  const ids: string[] = [];

  // 1 dia antes às 08:00
  const umDia = new Date(`${dataISO}T08:00:00`);
  umDia.setDate(umDia.getDate() - 1);
  const id1d = await agendarNotificacao(
    '📅 Evento amanhã',
    `"${local}" está marcado para amanhã às ${horario}.`,
    umDia,
    `agenda-${itemId}-1d`
  );
  if (id1d) ids.push(id1d);

  // 2 horas antes
  const duasH = new Date(eventoData.getTime() - 2 * 60 * 60 * 1000);
  const id2h = await agendarNotificacao(
    '🕑 Em 2 horas',
    `Evento "${local}" começa às ${horario}. Prepare-se!`,
    duasH,
    `agenda-${itemId}-2h`
  );
  if (id2h) ids.push(id2h);

  // 30 minutos antes
  const trintaMin = new Date(eventoData.getTime() - 30 * 60 * 1000);
  const id30m = await agendarNotificacao(
    '🔔 Em 30 minutos',
    `Evento "${local}" começa em breve!`,
    trintaMin,
    `agenda-${itemId}-30m`
  );
  if (id30m) ids.push(id30m);

  return ids;
}

/** Cancela todas as notificações de um evento da agenda. */
export async function cancelarNotificacoesAgenda(itemId: string): Promise<void> {
  await cancelarNotificacoes([
    `agenda-${itemId}-1d`,
    `agenda-${itemId}-2h`,
    `agenda-${itemId}-30m`,
  ]);
}
