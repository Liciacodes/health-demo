# Telehealth Dashboard

A full-stack telehealth patient dashboard built with Next.js, Three.js, Drizzle ORM, and Neon Postgres.

## Features

-  **3D Interactive Body Map** — click any body part to log a symptom, powered by Three.js raycasting
-  **Persistent Symptom Logging** — symptoms save to Postgres via Drizzle ORM and server actions
-  **Visit History** — view past and upcoming appointments
-  **Prescriptions** — view active and expired prescriptions
-  **Multi-tenant Architecture** — each clinic gets an isolated URL and data (`/[orgId]/dashboard`)

## Tech Stack

- **Framework** — Next.js 15 (App Router)
- **Language** — TypeScript
- **3D Rendering** — Three.js
- **ORM** — Drizzle ORM
- **Database** — Neon (serverless Postgres)
- **Styling** — Tailwind CSS


## Architecture
```
app/
  [orgId]/
    dashboard/
      page.tsx          ← server component, fetches all data
      layout.tsx        ← server component, renders nav
      dashboard-client.tsx  ← client component, handles interactivity
components/
  body-viewer.tsx       ← Three.js 3D body map
  symptom-modal.tsx     ← log symptom modal
  symptom-log.tsx       ← symptom list with delete
  nav.tsx               ← top navigation
lib/
  db/
    schema.ts           ← Drizzle table definitions
    index.ts            ← database client
  actions/
    symptoms.ts         ← server actions (log, fetch, delete)
```

## Getting Started

1. Clone the repo
```bash
git clone https://github.com/yourusername/telehealth-dashboard.git
cd telehealth-dashboard
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env.local
```
Add your Neon database URL:
```
DATABASE_URL=postgresql://...
```

4. Run migrations
```bash
npx dotenv-cli -e .env.local -- npx drizzle-kit generate
npx dotenv-cli -e .env.local -- npx drizzle-kit migrate
```

5. Seed the database
```sql
INSERT INTO patients (org_id, name, email, phone)
VALUES ('health-demo', 'Alex Rivera', 'alex@example.com', '555-0100');

INSERT INTO appointments (org_id, patient_id, provider, scheduled_at, status)
VALUES ('health-demo', 1, 'Dr. Sarah Chen', '2026-03-20 14:00:00', 'upcoming');

INSERT INTO prescriptions (org_id, patient_id, medication, dosage, frequency, prescribed_by, status)
VALUES 
  ('health-demo', 1, 'Lisinopril', '10mg', 'Once daily', 'Dr. Sarah Chen', 'active'),
  ('health-demo', 1, 'Metformin', '500mg', 'Twice daily', 'Dr. Sarah Chen', 'active');
```

6. Run the app
```bash
npm run dev
```

Open [http://localhost:3000/health-demo/dashboard](http://localhost:3000/health-demo/dashboard)