# **Domínio do Mago (Wizard's Domain)**
Gamified Time & Task Management Progressive Web Application

---

## **Executive Overview**
**Domínio do Mago** is an enterprise-grade Progressive Web Application (PWA) designed to transform productivity routines into an engaging role-playing game (RPG) experience. By applying battle-tested game design mechanics to daily task management, time tracking, and habit formation, the platform directly addresses cognitive fatigue and modern productivity friction.

Built with a decoupled, high-performance architecture, the project demonstrates modern web development practices including offline-first storage patterns, resilient API integration, server-side rendering, and responsive UI primitives optimized for mobile viewports.

---

## **Core Features**
- **Gamified Productivity Engine:** Convert real-world tasks into quests, earning experience points (XP), mana, and gold to unlock avatar upgrades, domains, and spell rewards.
- **Focus Mana Timer (Pomodoro Variant):** Integrated focus timer that converts deep-work intervals into channeled spell power, complete with custom audio cues and session telemetry.
- **Offline-First PWA Capabilities:** Full Progressive Web App manifest implementation using service workers, caching strategies, and optimistic local database synchronization via IndexedDB.
- **Real-time Analytics & Domain Progress:** High-impact metrics dashboards tracking habit consistency, velocity trends, and skill tree progressions over time.
- **Dynamic Skill Trees:** Flexible categorization allowing users to attribute completed work towards specific personal mastery paths (e.g., *Frontend Sorcery*, *Backend Alchemy*, *Mindfulness*).

---

## **Technology Stack & System Architecture**

### **Technical Stack Matrix**
| Layer | Technology | Key Capabilities & Justification |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js (App Router) | Server-Side Rendering (SSR), React Server Components, optimized bundle delivery, and built-in routing. |
| **UI & Styling** | Tailwind CSS + Radix UI | Utility-first, accessible design system primitives with ultra-low CSS footprint and custom responsive themes. |
| **PWA Infrastructure** | Serwist / Next-PWA | Custom service worker registration, background sync, and offline asset caching. |
| **Backend API** | Spring Boot 3.x (Java 21) | Robust RESTful APIs, Spring Security, JPA/Hibernate ORM, and enterprise-grade dependency injection. |
| **Persistence** | PostgreSQL + Redis | Relational data persistence backed by Redis in-memory layer for session management and rate limiting. |

### **System Architecture (High-Level)**
The project enforces a strict boundary separation between the presentation application and the core business logic engine, communicating via a secured REST API.

```text
+-----------------------+          HTTPS / JWT           +-----------------------+
|  CLIENT LAYER (PWA)   | -----------------------------> |  BACKEND LAYER (API)  |
|                       | <----------------------------- |                       |
|  - Next.js SSR/CSR    |                                |  - Spring Boot        |
|  - Tailwind + Framer  |                                |  - REST Controllers   |
|  - Service Worker     |                                |  - Domain Logic       |
|  - IndexedDB (Cache)  |                                |  - Spring Data JPA    |
+-----------------------+                                +-----------------------+
                                                                 |       |
                                                          +------v-+   +-v------+
                                                          |  Post- |   | Redis  |
                                                          | greSQL |   | Cache  |
                                                          +--------+   +--------+
```
