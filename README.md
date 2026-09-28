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
