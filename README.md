# 🧙‍♂️ Domínio do Mago (Wizard's Domain)

> **An Enterprise-Grade, Gamified Productivity & Time Management PWA**

[![Next.js](https://img.shields.io/badge/Next.js-14.x-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.x-6DB33F?style=for-the-badge&logo=spring)](https://spring.io/)
[![Java](https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=java)](https://oracle.com/java/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql)](https://postgresql.org/)

**Domínio do Mago** is not just a to-do list; it is a highly scalable, offline-capable Progressive Web Application (PWA) that leverages behavioral psychology and RPG mechanics to eliminate cognitive friction. Engineered with a strict mobile-first philosophy, it features native-like Glassmorphism interfaces, complex state management, and a high-performance Java/Spring Boot backend architecture.

---

## 🏗️ System Architecture & Data Flow

The platform relies on a decoupled architecture, separating the high-fidelity presentation layer from the core business logic and state persistence mechanisms.

### High-Level Topology

```text
    [ Mobile PWA / Web Client ]
              │
              │  (CSR / Optimistic UI Updates via React Query)
              ▼
    [ Next.js Server (BFF) ] ── SSR / API Routes ──┐
              │                                    │
              │  (JWT Secured REST / HTTPS)        │
              ▼                                    │
    [ Spring Boot 3 API ] ◄────────────────────────┘
    (Java 21 + Hibernate)
              │
      ┌───────┴────────┐
      ▼                ▼
[ PostgreSQL ]    [ Redis Cache ]
 (ACID State)      (Sessions/RL)
```

---

## 🧠 Core Engineering Pillars

### Mobile-First PWA & UI/UX Native Parity
- **Glassmorphism Engine:** Dynamic backdrop-blur UI tokens adapting to ambient Light/Dark mode themes without repaints.
- **Hardware-Accelerated Motion:** Framer Motion handles complex layout shifts (e.g., chat dynamic resizing, HUD hiding) utilizing GPU compositing to maintain a strict 60 FPS on mobile browsers.
- **Ergonomic SafeArea Management:** CSS environment variables (`env(safe-area-inset-bottom)`) ensure UI elements never overlap with iOS/Android native gesture bars.
- **Flexbox Viewport Trapping:** Advanced DOM structuring (`100dvh`) prevents rogue scrolling, delivering a monolithic app feel instead of a standard scrolling web page.

### Backend & Persistence (Spring Boot 3 + Java 21)
- **Stateless Authentication:** JWT-based security filter chain ensuring minimal overhead per request.
- **Data Integrity:** PostgreSQL with strict relational modeling for Users, Rituals (Habits), and XP ledgers.
- **Caching Strategy:** Redis integration for rapid retrieval of leaderboard telemetry and ephemeral session states.

### Gamification & Telemetry Engine
- **Event-Driven XP:** Completing routines dispatches events that calculate XP curves, Prana regeneration, and elemental affinities (Fire, Water, Earth, Air).
- **Time Blocking (Chronos):** Custom Pomodoro-style hooks managing component lifecycles, tracking deep work intervals, and preventing state loss during background execution via Web Workers.

---

## 💻 Tech Stack Deep Dive

### Frontend (Client & Edge)
- **Framework:** Next.js 14 (App Router) for hybrid static & server rendering.
- **Language:** TypeScript (Strict Mode) for end-to-end type safety.
- **Styling:** Tailwind CSS + custom design tokens (`design-tokens.ts`).
- **State & Fetching:** React Context API + Custom Hooks for localized state (e.g., `NavigationContext`).
- **Icons:** Lucide React.

### Backend (Core Services)
- **Framework:** Spring Boot 3.x
- **Language:** Java 21 (utilizing Virtual Threads and Record classes).
- **ORM:** Spring Data JPA (Hibernate).
- **Database:** PostgreSQL 16 (Primary) + Redis (Cache/Message Broker).
- **Containerization:** Docker & Docker Compose for isolated microservices environments.

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js 20+ & pnpm
- Java 21 (JDK) & Maven
- Docker & Docker Compose

### 1. Bootstrapping the Backend
The backend utilizes Docker to spin up the database and cache instantly.

```bash
# Clone the repository
git clone https://github.com/fabiorodrigues-tech-dev/dominio-do-mago.git
cd dominio-do-mago

# Start PostgreSQL and Redis containers
docker-compose up -d

# Start the Spring Boot API
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```
API will be available at `http://localhost:8080/api/v1`

### 2. Bootstrapping the Frontend
```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
pnpm install

# Create environment configuration
echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1" > .env.local

# Run the development server
pnpm dev
```
PWA will be available at `http://localhost:3000`

---

## 🛡️ License & Code Standards
This project is licensed under the MIT License.

### Engineering Standards
- **Git Flow:** Semantic commit messages (`feat`, `fix`, `refactor`, `docs`).
- **Code Quality:** Enforced via ESLint, Prettier, and strictly typed component props.
- **Versioning:** Managed via Git Tags (e.g., `v1.0.0-beta`).

---

> *"Productivity is not about doing more things; it's about doing the right things with absolute focus."*
