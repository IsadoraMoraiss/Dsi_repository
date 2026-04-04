# Brasil em Foco

Protótipo desenvolvido para as disciplinas de PISI 3 e DSI da UFRPE.

## Objetivo deste guia

Este passo a passo foi feito para os 5 membros do time configurarem o ambiente da mesma forma e conseguirem rodar o app sem divergencias.

## Pre-requisitos

1. Git instalado.
2. Node.js LTS (recomendado: 20.x).
3. npm (ja vem com o Node).
4. Expo Go no celular (Android ou iOS).

## Clone e acesso ao projeto

Clone o repositorio e entre na branch `dev`:

```bash
git clone https://github.com/SabinoGabriel/react_native
cd react_native
git checkout dev
```

## Instalacao de dependencias

Ainda dentro da pasta `react_native`:

```bash
npm install
```

## Como rodar no Expo Go (forma padrao)

1. Confirme que esta na pasta correta (`react_native`).
2. Suba o servidor Expo com tunnel:

```bash
npx expo start --tunnel --port 8084
```

3. Abra o app Expo Go no celular e escaneie o QR code exibido no terminal.

## Scripts uteis

```bash
npm run start
npm run android
npm run ios
npm run web
```

## Estrutura esperada

- Roteamento: Expo Router com raiz em `src/app`.
- Tokens de design: `src/constants/Colors.ts`.
- Componentes reutilizaveis: `src/components`.

## Troubleshooting rapido

### Erro: package.json nao encontrado

Se aparecer algo como `expected package.json path ... does not exist`, voce esta na pasta errada.

Entre na pasta correta e rode de novo:

```bash
cd react_native
npx expo start
```

### Porta ocupada ou cache antigo

```bash
npx expo start -c --tunnel --port 8084
```

## Versoes do projeto (referencia)

- expo: `~54.0.0`
- expo-router: `~6.0.23`
- react: `19.1.0`
- react-native: `0.81.5`
