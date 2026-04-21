
# Brasil em Foco

Protótipo desenvolvido para as disciplinas de PISI 3 e DSI da UFRPE.

## Objetivo deste guia

Este guia foi criado para ajudar novos desenvolvedores a entenderem a estrutura do projeto, boas práticas e como contribuir sem bagunçar o código. Siga as orientações para evitar erros comuns de organização e facilitar a manutenção.

## Pre-requisitos

1. Git instalado
2. Node.js LTS (recomendado: 20.x)
3. npm (já vem com o Node)
4. Expo Go no celular (Android ou iOS)

## Como começar

Clone o repositório e acesse a pasta do projeto:

```bash
git clone https://github.com/IsadoraMoraiss/Dsi_repository
cd Dsi_repository
```

Instale as dependências:

```bash
npm install
```

## Como rodar no Expo Go

1. Suba o servidor Expo:

```bash
npx expo start
```

2. Abra o app Expo Go no celular e escaneie o QR code exibido no terminal.

## Scripts úteis

```bash
npm run start   # Inicia o projeto
npm run android # Roda no emulador Android
npm run ios     # Roda no emulador iOS
npm run web     # Roda no navegador
```

## Estrutura do projeto

O projeto segue uma estrutura modular e escalável. Cada pasta tem um propósito claro. **Não coloque arquivos soltos fora do lugar!**


```
Dsi_repository/
├── assets/                # Imagens, ícones, fontes
│   ├── images/
│   ├── icons/
│   └── fonts/
├── src/
│   ├── app/               # Rotas e telas (Expo Router)
│   ├── components/        # Componentes reutilizáveis
│   │   ├── ui/            # Componentes genéricos (ex: PrimaryButton)
│   │   ├── auth/          # Componentes de autenticação
│   │   └── home/          # Componentes da home
│   ├── constants/         # Constantes de cor, tipografia, etc
│   ├── data/              # Dados mockados
│   ├── hooks/             # Custom hooks
│   ├── theme/             # Temas, estilos globais
│   ├── utils/             # Funções utilitárias
│   ├── lib/               # Wrappers de libs externas
│   ├── context/           # React Contexts globais
│   └── types/             # Tipos TypeScript globais
├── app.json
├── package.json
└── ...
```

### Dicas para não errar na organização

- **Componentes genéricos** (usados em vários lugares): coloque em `src/components/ui`.
- **Componentes de uma feature** (ex: autenticação): coloque em `src/components/auth`.
- **Telas**: sempre em `src/app`.
- **Dados mockados**: sempre em `src/data`.
- **Constantes**: sempre em `src/constants`.
- **Nunca** misture lógica de negócio, componentes e dados em uma mesma pasta.

### Exemplo de importação correta

```tsx
import PrimaryButton from '../components/ui/PrimaryButton';
import CustomInput from '../components/ui/CustomInput';
```


## Troubleshooting rápido

### Erro: package.json não encontrado

Se aparecer algo como `expected package.json path ... does not exist`, você está na pasta errada.

Entre na pasta correta e rode de novo:

```bash
cd Dsi_repository
npx expo start
```

### Porta ocupada ou cache antigo

```bash
npx expo start --clear
```

### Expo Go não conecta ao projeto

- Certifique-se de que o computador e o celular estão na **mesma rede Wi-Fi**. Se estiverem em redes diferentes (ex: computador no cabo ou Wi-Fi 5GHz e celular no 2.4GHz), o app pode não encontrar o servidor.
- Se necessário, reinicie o Expo Go e o servidor Expo.
- Verifique se há firewall ou VPN bloqueando a conexão.

## Versões do projeto (referência)

- expo: `~54.0.0`
- expo-router: `~6.0.23`
- react: `19.1.0`
- react-native: `0.81.5`
