# Logística Master — Versão Apresentação

Este repositório contém a versão aprimorada do _Logística Master_ — visual moderno, responsivo e focado em apresentação.

## O que foi melhorado

- UI/UX: tema escuro elegante, loader, splash, HUD, efeito de partículas de fundo.
- Controles mobile-only com estilo polido e foco acessível.
- Pequenas melhorias de jogabilidade: placar, timer, níveis e tela de fim com medalha.
- Áudio gerado via WebAudio para "click" (sem arquivos externos).
- Código reorganizado com um módulo `logisticaUI` exposto para integração com sua lógica existente.

## Como usar

1. Abra `index.html` em um servidor local (recomendado: Live Server do VSCode).
2. Clique em **Iniciar Simulação** para ver a nova interface.
3. Integre `window.logisticaUI.addScore(value)` no seu jogo para aumentar pontuação.
4. Chame `window.logisticaUI.endGame()` para mostrar a tela final.

## Observações

- Conserto para deploy via GitHub Pages: este projeto é estático, você pode publicar a pasta no seu repositório para que funcione.
- Se quiser que eu integre as mudanças diretamente na lógica do jogo (movimentação de caixas, pontuação automática etc.), posso fazer isso também — me diga o comportamento desejado.
