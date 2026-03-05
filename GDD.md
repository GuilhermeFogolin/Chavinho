# GDD: Vila Kombat – O Duelo da Vizinhança

## 1. Visão Geral
**Título:** Vila Kombat
**Gênero:** Luta / Combat (2D)
**Plataforma:** Web (GitHub Pages)
**Motor de Desenvolvimento:** Antigravity (HTML5 Canvas / Vanilla JS)
**Público-alvo:** Fãs do seriado e jogadores casuais.

## 2. Conceito do Jogo
Um jogo de combate casual onde os icônicos personagens da Vila do Chaves resolvem seus desentendimentos de forma lúdica, utilizando seus objetos mais característicos como "armas".

## 3. Personagens e Mecânicas de Combate

| Personagem | Arma Principal | Estilo de Luta |
| :--- | :--- | :--- |
| **Chaves** | Sanduíche de Presunto | Equilibrado. Ataques de curto alcance e "cura" passiva lenta. |
| **Kiko** | Bola de Futebol Americano | Longo alcance. Arremessa a bola para manter distância do oponente. |
| **Chiquinha** | Boneca de Pano | Ágil. Ataques rápidos e movimentos de esquiva mais eficientes. |

### Atributos Base:
- **HP (Vida):** 100 pontos.
- **Energia:** Barra que carrega para usar um "Ataque Especial" (implementado visualmente, futuro para habilidades especiais).

## 4. Cenário
**Local:** O pátio principal da Vila.
**Elementos Visuais:** O icônico barril do Chaves no centro (visual), a escada para a casa da Dona Florinda e a porta da casa do Seu Madruga.

## 5. Modos de Jogo
- **Modo 1 Player (Single Player):** O jogador escolhe seu personagem e enfrenta a CPU (o sistema) em uma melhor de 3 rounds.
- **Modo 2 Players (Local):** Dois jogadores dividem o mesmo teclado para lutar um contra o outro.

### Controles Sugeridos:
- **P1:** WASD (Movimento) + F (Ataque).
- **P2:** Setas (Movimento) + L (Ataque).

## 6. Interface (UI/UX)
- **Tela Inicial:** Opções "1 Player", "2 Players" e "Como Jogar".
- **Seleção de Personagem:** Menu interativo para escolher o lutador e o oponente (no modo 1P).
- **HUD de Batalha:** Barras de vida no topo, nomes dos personagens e cronômetro central.
