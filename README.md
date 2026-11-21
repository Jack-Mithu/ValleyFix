# 🔧 ValleyFix

**A full-stack home-repair service platform.** Customers book vetted technicians, technicians manage their jobs, and admins oversee the whole marketplace — from booking to invoice to review.

![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat-square&logo=nestjs&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)

---

## ✨ Features

**Customers**
- Register, manage a profile and saved addresses
- Browse service categories and available technicians
- Book a service through a guided booking flow
- Track bookings from a personal dashboard

**Technicians**
- Register and go through an admin approval process
- Set the services they offer, service areas and weekly availability
- Manage jobs from a dedicated dashboard

**Admins**
- Approve or reject technicians
- Manage users, admins and bookings
- Review a full audit log of platform activity

**Platform domain** — the data model already covers quotes, jobs (notes, photos, materials, signatures), invoices, payments, notifications and reviews.

---

## 🏗️ Architecture

```
ValleyFix/
├── backend/   NestJS REST API · Prisma ORM · PostgreSQL · JWT auth (Passport)
└── web/       Next.js 16 App Router · React 19 · Motion · Lucide icons
```

| Layer | Tech |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript |
| API | NestJS, class-validator, Passport JWT, bcrypt, Multer uploads |
| Database | PostgreSQL via Prisma (migrations + seed) |
| Testing | Vitest (unit + e2e), oxlint |

---

## 🚀 Getting started

### Prerequisites
- Node.js 20+
- PostgreSQL 15+

### 1. Install
```bash
git clone https://github.com/Jack-Mithu/ValleyFix.git
cd ValleyFix
npm install
npm install --prefix backend
npm install --prefix web
```

### 2. Configure environment

`backend/.env`
```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/valleyfix"
JWT_SECRET="change-me"
PORT=3000
CORS_ORIGINS="http://localhost:3001"
```

`web/.env.local`
```env
NEXT_PUBLIC_API_URL="http://localhost:3000"
BACKEND_API_URL="http://localhost:3000"
```

### 3. Set up the database
```bash
cd backend
npx prisma migrate dev
npm run seed
cd ..
```

### 4. Run
```bash
npm run dev          # starts API (:3000) and web (:3001) together
```
Or individually with `npm run dev:api` / `npm run dev:web`.

Open **http://localhost:3001**.

---

## 🧪 Scripts (backend)

| Command | Description |
|---|---|
| `npm run start:dev` | API in watch mode |
| `npm run test` | Unit tests |
| `npm run test:e2e` | End-to-end tests |
| `npm run lint` | Lint with oxlint |
| `npm run seed` | Seed the database |

---

## 👤 Author

**Mithusanth Sukumar** — [GitHub](https://github.com/Jack-Mithu) · [LinkedIn](https://linkedin.com/in/sukumar-mithushanth)
