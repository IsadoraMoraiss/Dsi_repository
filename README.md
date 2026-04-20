# Brasil em Foco

Protótipo desenvolvido para as disciplinas de PISI 3 e DSI da UFRPE.

## Fluxo recomendado

1. Desenvolver em blocos pequenos por funcionalidade.
2. Manter commits curtos e objetivos.
3. Validar o app no Expo Go antes de cada push.

## Instalação

```bash
npm install
```

Se houver conflito de dependências no npm:

```bash
npm install --legacy-peer-deps
```

## Execução

```bash
npx expo start
```

## Estrutura atual

- Rotas do app: `src/app`
- Componentes reutilizáveis: `src/components`
- Tokens de cor: `src/constants/colors.ts`