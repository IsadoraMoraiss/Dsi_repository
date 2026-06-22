import { MaterialIcons } from '@expo/vector-icons';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import * as Clipboard from 'expo-clipboard';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Modal,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../services/firebase';
import { Colors } from '../constants/Colors';
import { guiasLocais } from '../data/mockGuias';

function normalizar(texto: string | undefined | null) {
    return (texto ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

function guiaAtendeCidade(guia: any, cidade?: string) {
    const alvo = normalizar(cidade);
    if (!alvo) return false;

    const cidades = [
        ...(Array.isArray(guia.cidades) ? guia.cidades : []),
        ...(Array.isArray(guia.cidadeNomes) ? guia.cidadeNomes : []),
    ];

    return cidades.some((nome) => normalizar(nome) === alvo);
}

export default function GuiasScreen() {
    const router = useRouter();
    const { cidade, cidadeId } = useLocalSearchParams();
    const cidadeSelecionada = Array.isArray(cidade) ? cidade[0] : cidade;
    const cidadeIdSelecionada = Array.isArray(cidadeId) ? cidadeId[0] : cidadeId;

    const [guias, setGuias] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [fotoSelecionada, setFotoSelecionada] = useState<string | null>(null);
    async function copiarTelefone(numero: string) {
        if (!numero) return;
        await Clipboard.setStringAsync(numero);
        alert('Telefone copiado para a área de transferência!');
    }

    async function carregarGuias() {
        const mocks = guiasLocais.filter((guia) => guiaAtendeCidade(guia, cidadeSelecionada));

        if (!db) {
            setGuias(mocks);
            setLoading(false);
            return;
        }

        try {
            const q = query(
                collection(db, 'guias'),
                where('status', '==', 'aprovado')
            );

            const snapshot = await getDocs(q);

            const lista = snapshot.docs
                .map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }))
                .filter((guia: any) => guiaAtendeCidade(guia, cidadeSelecionada));
            console.log('Cidade recebida:', cidadeSelecionada);
            console.log('Guias encontrados:', lista);

            const byId = new Map<string, any>();
            [...mocks, ...lista].forEach((guia) => byId.set(guia.id, guia));
            setGuias(Array.from(byId.values()));
        } catch (error) {
            console.log(error);
            setGuias(mocks);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        carregarGuias();
    }, [cidadeSelecionada]);

    function voltarParaCidade() {
        if (router.canGoBack()) {
            router.back();
            return;
        }

        if (cidadeIdSelecionada) {
            router.replace({ pathname: '/detalhes-cidade', params: { id: cidadeIdSelecionada } });
        }
    }

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator
                    size="large"
                    color={Colors.primary}
                />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <TouchableOpacity style={styles.backHeaderBtn} onPress={voltarParaCidade} activeOpacity={0.75}>
                <MaterialIcons name="arrow-back" size={24} color={Colors.textWhite} />
                <Text style={styles.backHeaderText}>Voltar para cidade</Text>
            </TouchableOpacity>
            <Text style={styles.title}>
                Guias Turísticos
            </Text>

            <Text style={styles.subtitle}>
                {cidadeSelecionada}
            </Text>

            <FlatList
                data={guias}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View style={styles.headerCard}>
                            <Text style={styles.nome}>
                                {item.nome}
                            </Text>

                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() => setFotoSelecionada(item.foto_perfil)}
                            >
                                <Image
                                    source={{
                                        uri: item.foto_perfil || 'https://picsum.photos/200',
                                    }}
                                    style={styles.fotoPerfil}
                                />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.duasColunas}>
                            <View style={styles.coluna}>
                                <Text style={styles.label}>Tempo de experiência</Text>

                                <View style={styles.valueChip}>
                                    <Text style={styles.valueText}>
                                        {item.experiencia}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.coluna}>
                                <Text style={styles.label}>Valor do passeio</Text>

                                <View style={styles.valueChip}>
                                    <Text style={styles.valueText}>
                                        R$ {item.valor}/{item.tipoCobranca === 'grupo' ? 'grupo' : 'pessoa'}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {item.codigoIdentificacao ? (
                            <View style={styles.row}>
                                <MaterialIcons
                                    name="badge"
                                    size={22}
                                    color={Colors.primary}
                                />

                                <View style={styles.infoContainer}>
                                    <Text style={styles.label}>Código de identificação</Text>

                                    <View style={styles.valueChip}>
                                        <Text style={styles.valueText}>
                                            {item.codigoIdentificacao}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        ) : null}

                        {item.especializacao ? (
                            <View style={styles.row}>
                                <MaterialIcons
                                    name="explore"
                                    size={22}
                                    color={Colors.primary}
                                />

                                <View style={styles.infoContainer}>
                                    <Text style={styles.label}>Especialização</Text>

                                    <Text style={styles.descricao}>
                                        {item.especializacao}
                                    </Text>
                                </View>
                            </View>
                        ) : null}

                        <View style={styles.row}>
                            <MaterialIcons
                                name="language"
                                size={22}
                                color={Colors.primary}
                            />

                            <View style={styles.infoContainer}>
                                <Text style={styles.label}>Idiomas</Text>

                                <View style={styles.valueChip}>
                                    <Text style={styles.valueText}>
                                        {Array.isArray(item.idiomas)
                                            ? item.idiomas.join(' • ')
                                            : item.idiomas}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.row}>
                            <MaterialIcons
                                name="description"
                                size={22}
                                color={Colors.primary}
                            />

                            <View style={styles.infoContainer}>
                                <Text style={styles.label}>Sobre o guia</Text>

                                <Text style={styles.descricao}>
                                    {item.descricao}
                                </Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.botao}
                            onPress={() => copiarTelefone(item.telefone)}
                            activeOpacity={0.8}
                        >
                            <MaterialIcons
                                name="phone"
                                size={20}
                                color="#fff"
                            />

                            <Text style={styles.botaoTexto}>
                                {item.telefone}
                            </Text>

                            <MaterialIcons
                                name="content-copy"
                                size={18}
                                color="#fff"
                                style={{ marginLeft: 8 }}
                            />
                        </TouchableOpacity>
                    </View>
                )}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <MaterialIcons
                            name="support-agent"
                            size={60}
                            color={Colors.textGray}
                        />
                        <Text style={styles.emptyText}>
                            Nenhum guia disponível para esta cidade.
                        </Text>
                    </View>
                }
            />

            <Modal
                visible={!!fotoSelecionada}
                transparent
                animationType="fade"
            >
                <TouchableOpacity
                    style={styles.modalBackground}
                    activeOpacity={1}
                    onPress={() => setFotoSelecionada(null)}
                >
                    <Image
                        source={{ uri: fotoSelecionada! }}
                        style={styles.fotoAmpliada}
                    />
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        padding: 20,
    },

    title: {
        color: Colors.textWhite,
        fontSize: 24,
        fontWeight: '700',
    },

    backHeaderBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: 8,
        marginBottom: 12,
    },

    backHeaderText: {
        color: Colors.textWhite,
        fontWeight: '700',
    },

    subtitle: {
        color: Colors.primary,
        marginBottom: 20,
    },

    card: {
        backgroundColor: Colors.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
    },


    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },

    info: {
        color: Colors.textWhite,
        marginLeft: 8,
    },

    descricao: {
        color: Colors.textWhite,
        fontSize: 15,
        lineHeight: 22,
        marginTop: 2,
    },

    botao: {
        backgroundColor: Colors.primary,
        borderRadius: 12,
        padding: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },

    botaoTexto: {
        color: '#fff',
        fontWeight: '700',
        marginLeft: 8,
    },

    empty: {
        alignItems: 'center',
        marginTop: 80,
    },

    emptyText: {
        color: Colors.textWhite,
        marginTop: 10,
    },
    infoContainer: {
        marginLeft: 10,
        flex: 1,
    },

    duasColunas: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 18,
    },

    coluna: {
        width: '48%',
    },

    valueChip: {
        alignSelf: 'flex-start', // <-- adiciona isso
        backgroundColor: Colors.primary,
        borderRadius: 16,
        paddingVertical: 8,
        paddingHorizontal: 14,
        marginTop: 6,
    },
    valueText: {
        color: '#FFF',
        fontWeight: '700',
    },

    label: {
        color: Colors.textWhite,
        fontWeight: '700',
        fontSize: 13,
    },
    fotoPerfil: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 2,
        borderColor: Colors.primary,
    },

    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    fotoAmpliada: {
        width: 280,
        height: 280,
        borderRadius: 140,
        borderWidth: 3,
        borderColor: '#fff',
    },
    headerCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 18,
    },

    fotoGuia: {
        width: 70,
        height: 70,
        borderRadius: 35,
        borderWidth: 3,
        borderColor: Colors.primary,
    },

    nome: {
        flex: 1,
        color: Colors.textWhite,
        fontSize: 22,
        fontWeight: '700',
        paddingRight: 12,
    },
});
