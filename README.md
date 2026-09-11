# Agendamento Odontológico

Sistema web (MVP) para gerenciamento de pacientes, profissionais e atendimentos odontológicos.

## Stack

| Camada | Tecnologias |
|--------|-------------|
| Frontend (`front/`) | React 18, Vite, TypeScript strict, Tailwind CSS, React Router, React Hook Form, Zod, TanStack Query, Axios, Sonner |
| Backend (`back/`) | NestJS 10, TypeORM, PostgreSQL, JWT/Passport, bcrypt, class-validator, Swagger, Helmet, Throttler |
| Infra | Docker, Docker Compose (multi-stage + BuildKit cache) |

Estrutura alinhada ao `app-sol` (`front/` + `back/` + TypeORM). Build Docker inspirado no `chat-bot`.

## Arquitetura

```
agendamento/
├── front/                 # SPA React (+ front/.env)
├── back/                  # API NestJS (+ back/.env)
├── docker-compose.yml
├── start-docker.sh
└── README.md
```

### Backend (`back/src`)

- `auth/` — login JWT, guards, roles
- `users/`, `patients/`, `professionals/`, `appointments/` — domínio
- `dashboard/` — resumo do painel
- `database/` — TypeORM, entities, data-source, seed
- `migration/` — migrations versionadas
- `common/` — enums, filtros, utils, datetime
- `health/` — health check

### Frontend (`front/src`)

- `pages/`, `layouts/`, `components/` — UI (incl. Loading/Empty/Error)
- `features/` — agenda visual, formulários de domínio
- `hooks/`, `services/`, `schemas/`, `types/`, `context/`, `routes/`, `utils/`

## Pré-requisitos

- Node.js 20+
- npm 10+
- Docker + Docker Compose

## Configuração

```bash
cp back/.env.example back/.env
cp front/.env.example front/.env
```

Ajuste `DB_PASSWORD` e `JWT_SECRET` em `back/.env` antes de qualquer ambiente real.

## Subir com Docker

Forma recomendada:

```bash
./start-docker.sh
```

O script cria `.env` se necessário, sobe a stack, aguarda o Postgres e roda **apenas as migrations** (schema vazio).

```bash
docker compose up -d
```

O compose usa `target: development` (hot reload + volumes).

Build de produção:

```bash
docker build -t agendamento-back --target production ./back
docker build -t agendamento-front --target production --build-arg VITE_API_URL=http://localhost:3333 ./front
```

| Serviço   | URL |
|-----------|-----|
| Frontend  | http://localhost:3000 |
| Backend   | http://localhost:3333/api |
| Swagger   | http://localhost:3333/api/docs |
| Health    | http://localhost:3333/api/health |
| Postgres  | localhost:5432 |

## Desenvolvimento local (sem Docker para apps)

```bash
docker compose up -d postgres
```

```bash
cd back && cp .env.example .env && npm install && npm run start:dev
```

```bash
cd front && cp .env.example .env && npm install && npm run dev
```

## Migrations e seed

A migration `InitialSchema` cria só a estrutura (tabelas, enums, FKs). **Não insere dados.**

```bash
cd back
npm run migration:run
```

Seed opcional (somente usuário admin, sem pacientes/profissionais/agenda):

```bash
npm run seed
```

| Campo | Valor |
|-------|--------|
| E-mail | `admin@agendamento.local` |
| Senha | `Admin@123` |
| Papel | ADMIN |

**Nunca use essas credenciais em produção.** Em Docker: `docker compose exec back npm run seed`

Reverter última migration:

```bash
npm run migration:revert
```

## Usuário inicial

Não há dados de demo. Após `migration:run`, rode `npm run seed` se quiser o admin de desenvolvimento, ou cadastre usuários conforme o fluxo da aplicação.

## Regras de negócio (MVP)

- Pacientes nascem **PENDING**; só pacientes **CONFIRMED** entram em novos agendamentos.
- Profissionais **INACTIVE** não podem ser vinculados a novos agendamentos.
- Agendamento exige dentista responsável; auxiliar é opcional.
- Participantes ficam em `appointment_participants` — permite múltiplos dentistas e auxiliares por atendimento.
- Conflito de horário do profissional responsável retorna **409** com mensagem em português.
- Status de agendamento: SCHEDULED → CONFIRMED → COMPLETED; CANCELLED encerra o fluxo.
- Soft-status: sem DELETE físico nas entidades principais.
- Horários em `timestamptz`; timezone da aplicação: `America/Sao_Paulo`.
- Labels da UI em português; enums da API em inglês.

## API (endpoints)

Todas as rotas (exceto login e health) exigem `Authorization: Bearer <JWT>`.

| Método | Endpoint | Auth |
|--------|----------|------|
| POST | `/api/auth/login` | Público (rate limit) |
| GET | `/api/auth/me` | JWT |
| GET | `/api/dashboard/summary` | JWT |
| GET/POST | `/api/patients` | JWT |
| GET/PATCH | `/api/patients/:id` | JWT |
| PATCH | `/api/patients/:id/confirm` | JWT |
| PATCH | `/api/patients/:id/inactivate` | JWT |
| GET/POST | `/api/professionals` | JWT |
| GET/PATCH | `/api/professionals/:id` | JWT |
| PATCH | `/api/professionals/:id/inactivate` | JWT |
| PATCH | `/api/professionals/:id/activate` | JWT |
| GET/POST | `/api/appointments` | JWT |
| GET/PATCH | `/api/appointments/:id` | JWT |
| PATCH | `/api/appointments/:id/confirm` | JWT |
| PATCH | `/api/appointments/:id/complete` | JWT |
| PATCH | `/api/appointments/:id/cancel` | JWT |
| GET | `/api/health` | Público |

Roles (`ADMIN` / `USER`) via `RolesGuard`. Documentação interativa: `/api/docs`.

## Segurança

- Helmet habilitado
- CORS restrito a `CORS_ORIGIN`
- JWT obrigatório nas rotas privadas
- Rate limit no login (`Throttler`)
- Validação global (`ValidationPipe` whitelist + forbidNonWhitelisted)
- Filtro global de exceções (`AllExceptionsFilter`) — mensagens genéricas em produção
- Senhas com bcrypt; `JWT_SECRET` obrigatório na subida

## Testes e qualidade

```bash
cd back && npm run test && npm run lint && npm run build
cd front && npm run lint && npm run build
```

Cobertura crítica no backend: auth, patients, professionals, appointments (conflitos), dashboard, datetime util, health.

## Decisões técnicas

- Pastas `front/` / `back/` (app-sol)
- TypeORM + migrations (`synchronize` desligado)
- Auth JWT + Passport + bcrypt
- Docker multi-stage com `npm ci` + cache BuildKit
- Agenda visual dia/semana com blocos por duração

## Modelo de dados

- `users` — ADMIN / USER
- `patients` — PENDING / CONFIRMED / INACTIVE
- `professionals` — DENTIST / ASSISTANT + ACTIVE / INACTIVE
- `appointments` — `start_at`, `end_at`, duração, status
- `appointment_participants` — RESPONSIBLE / ASSISTANT

## Fases

1. ✅ Estrutura, Docker, configs, health check
2. ✅ Banco e migrations (schema sem dados)
3. ✅ Auth JWT (login, guards, rotas privadas)
4. ✅ Layout + painel (dashboard)
5. ✅ Pacientes
6. ✅ Profissionais
7. ✅ Agendamentos + conflitos
8. ✅ Agenda visual (dia/semana)
9. ✅ Refino UX (Loading/Empty/Error, responsivo, labels PT)
10. ✅ Swagger, testes críticos, segurança, README final

## Fora do MVP

Integrações futuras (não implementadas): Google Calendar, WhatsApp, multi-clínica, notificações push, etc.
