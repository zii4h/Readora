# 🌿 Readora

**A little reading. A deeper understanding.**

Readora is a gamified reading comprehension platform designed to help learners develop their comprehension skills through short, structured reading exercises. It provides section-based questions with immediate feedback, tracks performance across four comprehension skills, and recommends exercises based on the learner's reading level and areas that need improvement.

## Preview
<img width="1886" height="905" alt="Image" src="https://github.com/user-attachments/assets/ace40050-6729-40ae-a1a8-487784ad835c" />

<img width="1886" height="900" alt="Image" src="https://github.com/user-attachments/assets/dde644b1-3d9f-4c71-85aa-94e2f880deb8" />

## Features

| Role | Features |
| --- | --- |
| **GUEST** | Browse the reading catalog and view exercise details |
| **LEARNER** | Complete reading exercises, track comprehension skills, earn XP and achievements, and receive recommendations |
| **SUPERVISOR** | Connect with learners, review progress, and assign exercises |
| **ADMINISTRATOR** | Create, edit, publish, and manage reading materials and assessments |

### Four Comprehension Skills
The system evaluates learners' reading comprehension based on four core skills:

- Literal Understanding
- Vocabulary in Context
- Main Idea
- Inference

## DEMO ACCOUNTS

The following accounts are available when demo accounts have been seeded.

| Role | Username | Password |
| --- | --- | --- |
| Learner | `learner` | `ReadoraDemo123!` |
| Supervisor | `supervisor` | `ReadoraDemo123!` |
| Administrator | `admin` | `ReadoraDemo123!` |

> [!IMPORTANT]
> Demo accounts are publicly accessible and share the same data. Changes made by users may affect others. Avoid entering sensitive information.

## TECH STACK

- **Frontend:** React, Vite, CSS, Lucide
- **Backend:** Node.js
- **Database:** SQLite (local) / Supabase PostgreSQL (hosted)
- **Deployment:** Vercel

## RUNNING LOCALLY
### Prerequisites

- Node.js 24 LTS (or a supported version 22.13+)
- npm
- Git

### 1. Clone the repository

```bash
git clone https://github.com/zii4h/Readora.git
cd Readora
npm install
```

### 2. Configure environment variables

Create a `.env` file from the provided template.

**Windows (PowerShell):**

```powershell
Copy-Item .env.example .env
```

**macOS / Linux:**

```bash
cp .env.example .env
```

---
The application supports two database configurations.

**Option A — SQLite (local only)**

Leave `DATABASE_URL` unset in `.env`. Readora will use a local SQLite database and initialize it automatically on the first run.

**Option B — Supabase PostgreSQL**

For a PostgreSQL database, configure the following in `.env`:

```dotenv
DATABASE_URL=your_supabase_connection_string
DEMO_SEED=1
ADMIN_USERNAME=admin
ADMIN_NAME=Administrator
ADMIN_PASSWORD=your_secure_password
```

Then initialize the database:

```bash
npm run db:setup
```

> [!IMPORTANT]
> - Replace `DATABASE_URL` with your own Supabase PostgreSQL connection string.
> - Keep `DEMO_SEED=1` to enable demo accounts, or set it to `0` to disable demo account seeding.
> - Optionally, customize `ADMIN_USERNAME` and `ADMIN_NAME`.
> - Set a secure `ADMIN_PASSWORD` with at least 12 characters.

### 3. Run the application

```bash
npm run dev
```

Open **http://localhost:5173** in your browser.

## BUILD & TESTING

```bash
npm test
npm run build
npm start
```

The production build is served locally at **http://localhost:3001**.


## LEARNING & PROGRESS

Readora measures comprehension performance using the learner's completed assessments.

**Skill Performance = (Correct Answers / Total Questions Answered) × 100**

Reading levels are determined from cumulative performance after the baseline assessment:

| Performance | Reading Level |
| --- | --- |
| Below 50% | Beginner |
| 50% to below 75% | Intermediate |
| 75% and above | Advanced |

Learners earn XP through the baseline and first-time exercise completions. Recommendations prioritize their current reading level and lowest-performing comprehension skill.

## SCOPE

Readora is an initial working system developed for academic purposes. It supports reading exercises, comprehension assessments, learner progress tracking, supervisor assignments, and content management.

Current limitations include no password recovery, email verification, automated question generation, or file uploads. The included practice materials are not standardized assessments.

## LICENSE

See [MIT License](https://github.com/zii4h/Readora/blob/main/LICENSE) © 2026 [zii4h](https://github.com/zii4h).
