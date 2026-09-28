```markdown
# 🔮 DOMÍNIO DO MAGO — ARCHITECTURAL MANIFESTO & PWA RUNTIME

<div align="center">

![Project Status](https://img.shields.io/badge/System_Status-BETA_1.0-8B5CF6?style=for-the-badge&logo=statuspage&logoColor=white)
![Frontend Runtime](https://img.shields.io/badge/Frontend-Next.js_14_SSR%2FCSR-000000?style=for-the-badge&logo=next.js&logoColor=white)
![UI Architecture](https://img.shields.io/badge/Styling-Tailwind_Glassmorphism-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Core Engine](https://img.shields.io/badge/Backend-Spring_Boot_3.x-6DB33F?style=for-the-badge&logo=spring&logoColor=white)
![Language Runtime](https://img.shields.io/badge/Runtime-Java_21_LTS-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![State Persistence](https://img.shields.io/badge/Persistence-PostgreSQL_16_|_Redis-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

<p align="center">
  <strong>Uma Progressive Web App (PWA) de Alto Rendimento com Paradigma Mobile-First, Arquitetura Desacoplada e Gamificação Comportamental Imersiva através de Vidro Translúcido Adaptativo (Liquid Glassmorphism).</strong>
</p>

[Arquitetura](#-arquitetura-do-sistema--fluxo-de-dados) • [Pilares de Engenharia](#-pilares-de-engenharia-de-software) • [UI/UX Spec](#-especificação-técnica-de-uiux-mobile-first) • [Stack Tecnológica](#-matriz-tecnológica) • [Setup & Deploy](#-ambiente-de-desenvolvimento--deploy)

---

</div>

## 🌌 Visão Geral Executiva

O **Domínio do Mago** é uma plataforma de engenharia de software desenhada para resolver a fadiga cognitiva e o atrito na gestão de produtividade moderna. Abandonando o modelo tradicional de listas de tarefas lineares (*To-Do Lists*), o ecossistema funde conceitos de neurociência comportamental e teorias de *game design* (sistemas RPG de progressão elemental) numa aplicação web progressiva de baixa latência e persistência híbrida.

A aplicação foi concebida sob uma filosofia rigorosa de **Navegação Móvel Nativa (Native Parity)**: zero dependência de controlos de browsers convencionais, gestão precisa de áreas de segurança (*Safe Areas* no iOS/Android), taxa de refrescamento sustentada a 60 FPS com aceleração de hardware e renderização de layouts elásticos baseados no viewport dinâmico (`100dvh`).

---

## 🏛️ Arquitetura do Sistema & Fluxo de Dados

A infraestrutura adota o padrão de desacoplamento rigoroso entre a camada de apresentação cliente (Edge PWA) e o motor de orquestração analítica transacional de retaguarda (*Stateless Core API*).


```

┌──────────────────────────────────────────────────────────────────────────────────┐
│                               CLIENT EDGE (PWA)                                  │
│                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────┐   │
│   │                         Next.js App Router (Client)                      │   │
│   │                                                                          │   │
│   │  [Dynamic Island HUD]    [Orquestrador Arcano]    [Quadro Temporal]      │   │
│   │  • Micro-Métricas        • Conversational UI      • Time Blocking        │   │
│   │  • Safe Area Inset       • Flex Column (100dvh)   • Gestão de Rituais    │   │
│   └────────────────────────────────────┬─────────────────────────────────────┘   │
│                                        │ Reactive Cache / Optimistic UI          │
│   ┌────────────────────────────────────▼─────────────────────────────────────┐   │
│   │               Service Worker Engine & Storage Offline                    │   │
│   │         (Cache API • Web Storage • Sincronização Desacoplada)            │   │
│   └────────────────────────────────────┬─────────────────────────────────────┘   │
└────────────────────────────────────────┼─────────────────────────────────────────┘
│
│ HTTPS / mTLS / Assinatura JWT
▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             BACKEND ENGINE (REST API)                            │
│                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────┐   │
│   │                        Spring Boot 3.x Ecosystem                         │   │
│   │                                                                          │   │
│   │  [Security Filter Chain] ──> [Domain Services] ──> [Game Telemetry]      │   │
│   │  • Stateless Bearer Auth    • Regras de Negócio   • Curvas de XP & Prana │   │
│   │  • CORS & Rate Limiting     • Orquestração IA     • Algoritmo de Ranking │   │
│   └────────────────────────────────────┬─────────────────────────────────────┘   │
│                                        │                                         │
│                    ┌───────────────────┴───────────────────┐                     │
│                    ▼                                       ▼                     │
│         ┌──────────────────────┐               ┌───────────────────────┐         │
│         │   PostgreSQL 16 DB   │               │   Redis Cache Node    │         │
│         │  (ACID / Relacional) │               │  (Sessões & Leaderboard)│        │
│         └──────────────────────┘               └───────────────────────┘         │
└──────────────────────────────────────────────────────────────────────────────────┘

```

---

## 🛠️ Pilares de Engenharia de Software

### 1. Liquid Glassmorphism & Micro-Design System
A interface implementa o padrão de *vidro fosco adaptativo*, evitando painéis opacos agressivos no Modo Claro (*Light Mode*) e pretos puros no Modo Escuro (*Dark Mode*):
* **Fórmula de Dispersão de Camada:** Injeção combinada de `backdrop-blur-xl` / `backdrop-blur-2xl` com valores de canal alfa calculados (`bg-white/60` a `bg-white/80` no tema claro e `bg-[#0B0B10]/80` no escuro).
* **Contraste de Acessibilidade:** Conformidade rigorosa com normas WCAG AAA em estados focados e desfocados, com isolamento de cores de acento para os quatro caminhos arcanos:
  * 🔴 **Fogo:** Ação, arranque de cronómetros e conclusão de tarefas de alto desgaste.
  * 🔵 **Água:** Fluxo contínuo, rituais regenerativos e restauro de Prana.
  * 🟢 **Terra:** Fundações técnicas, estudo de arquitetura e consistência a longo prazo.
  * ⚪ **Ar:** Orquestração IA, síntese cognitiva e processamento de ideias.

### 2. Viewport Trapping & Estabilidade de Layout (Zero Cumulative Layout Shift)
Para emular o comportamento de código nativo (Swift/Kotlin) dentro do browser:
* **Prevenção de Saltos de Scroll:** Toda a aplicação vive dentro de um invólucro estrito sem transbordo global (`overflow-hidden`), delegando o scroll exclusivamente para áreas dedicadas via `flex-1 overflow-y-auto`.
* **Dimensionamento `100dvh`:** Subtração dinâmica das margens de navegação de sistemas móveis (Dynamic Island do iPhone, barra de navegação do Android), mitigando os bugs históricos de ecrãs cortados.
* **Ergonomia Tátil:** Todos os elementos interativos possuem uma área mínima de clique de **44x44px**, estruturados numa barra de navegação inferior flutuante (*Dock Navigation*) com 5 nós equidistantes (`grid-cols-5`).

### 3. Orquestrador Conversacional Reativo
A aba do Orquestrador IA foi desenhada com uma pilha Flexbox pura:
* **Input Estático:** Fixação natural na base da árvore DOM (`shrink-0`), eliminando o uso de posicionamento absoluto (`absolute bottom-0`) que quebrava com a subida do teclado virtual mobile.
* **Stream de Mensagens:** Auto-scroll suavizado com proteção por debounce e âncora invisível (`messagesEndRef`).

---

## 📊 Matriz Tecnológica

| Camada | Tecnologia | Propósito & Justificação Arquitetural |
| :--- | :--- | :--- |
| **Frontend Framework** | **Next.js 14 (React 18)** | Renderização híbrida (SSR para casca estrutural, CSR para estados reativos), otimização automática de fontes e assets. |
| **Linguagem Frontend** | **TypeScript 5.x** | Tipagem estática rigorosa (`strict: true`), prevenindo erros de execução e referências indefinidas no cliente. |
| **Estilização** | **Tailwind CSS 3.4** | Utility-first compilation com tokens customizados (`design-tokens.ts`) para suporte nativo a variantes de tema. |
| **Motor de Animação** | **Framer Motion** | Interpolação baseada em física (springs) para alternância suave de abas e botões flutuantes via GPU. |
| **Iconografia** | **Lucide React** | Conjunto leve de ícones SVG vetorizados, reduzindo o payload inicial do bundle. |
| **Backend Core** | **Spring Boot 3.x** | Microframework enterprise com injeção de dependência resiliente, contratos REST estritos e suporte a Virtual Threads. |
| **Linguagem Backend** | **Java 21 (LTS)** | Uso de *Records*, *Pattern Matching* e otimizações de compilação da JVM moderna. |
| **Persistência Relacional** | **PostgreSQL 16** | Tabelas normalizadas, integridade referencial para rituais e histórico de XP. |
| **Cache & Leaderboard** | **Redis** | Sorted sets para cálculo instantâneo do ranking global/local de utilizadores. |
| **Contentorização** | **Docker Compose** | Paridade completa entre os ambientes de desenvolvimento, teste e produção. |

---

## 🧭 Estrutura do Repositório

```text
dominio-do-mago/
├── frontend/                       # Camada de Apresentação (Next.js PWA)
│   ├── components/                 # Componentes Atómicos e Moleculares
│   │   ├── orchestrator/           # Módulos do Chat e Orquestrador IA
│   │   ├── 3d/                     # Visualizadores e Assets Tridimensionais
│   │   ├── MagoDashboard.tsx       # Core Shell da Aplicação
│   │   └── MobileBottomNav.tsx     # Barra de Navegação Dock Mobile (5 Abas)
│   ├── contexts/                   # Provedores de Estado Global (Theme, Nav)
│   ├── lib/                        # Design Tokens e Utilitários de CSS
│   └── public/                     # Service Workers, Manifest e PWA Assets
├── src/main/java/                  # Motor de Negócio (Spring Boot Backend)
│   ├── controller/                 # Endpoints REST e Validação de DTOs
│   ├── service/                    # Lógica de Gamificação, XP e Rituais
│   ├── repository/                 # Camada de Acesso a Dados (Spring Data JPA)
│   └── model/                      # Entidades de Domínio
├── docker-compose.yml              # Orquestração local dos contentores (DB + Cache)
├── LICENSE                         # Licença MIT
└── README.md                       # Documentação de Engenharia

```

---

## ⚡ Ambiente de Desenvolvimento & Deploy

### Pré-requisitos

* **Node.js:** v20.x ou superior
* **Java SDK:** 21 LTS
* **Docker Engine & Docker Compose:** Ativos
* **Gerenciador de Pacotes:** `pnpm` ou `npm`

### 1. Inicialização dos Serviços de Infraestrutura

```bash
# Na raiz do projeto, suba as instâncias de base de dados e cache
docker-compose up -d postgres redis

```

### 2. Execução do Backend (Spring Boot)

```bash
# Executa a API com o perfil de desenvolvimento ativo
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

```

*API acessível em: `http://localhost:8080/api/v1*`

### 3. Execução da Camada Cliente (Frontend PWA)

```bash
cd frontend

# Instalação das dependências do ecossistema
pnpm install

# Inicialização do servidor de desenvolvimento Next.js
pnpm dev

```

*Aplicação acessível em: `http://localhost:3000*`

---

## 🔖 Estratégia de Versionamento

O projeto adota estritamente o modelo de **Versionamento Semântico (SemVer)** acompanhado por tags atómicas no Git:

* `v0.1.0-alpha`: Prova de conceito e fundação da base de dados relacional.
* `v1.0.0-beta`: Estabilização da arquitetura de UI/UX, resolução do modelo Flexbox e PWA mobile operacional *(Versão Atual)*.
* `v1.1.0`: Integração do Quadro Temporal Dinâmico e telemetria analítica com Recharts.
* `v2.0.0`: Lançamento da sincronização em tempo real e agentes inteligentes autônomos.

---

## 📄 Licença & Padrões de Código

Distribuído sob a licença **MIT**. Consulte o ficheiro [LICENSE](https://www.google.com/search?q=./LICENSE) para mais detalhes.

Desenvolvido segundo as diretrizes de código limpo, separação de responsabilidades (SoC), testes automatizados de regressão e obsessão pelo detalhe na experiência do utilizador móvel.

```

```
