# Readora

**A little reading. A deeper understanding.**

Readora is a working initial gamified reading comprehension system. Its core learning unit is a passage split into sections with questions and immediate explanatory feedback. It includes real server-side accounts, role permissions, persistent records, and an administrator content editor.

The name combines **read** with a short, memorable ending. It is a proposed project name, not a verified trademark or domain reservation.

## What is included

| Role          | Working features                                                                                                                                                                                              |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Guest         | Browse and filter the public catalog; inspect exercise details                                                                                                                                                |
| Learner       | Register/sign in, take the baseline, complete section-based multiple-choice exercises, resume unfinished work, review results, track four skills, receive recommendations, earn XP and permanent achievements |
| Supervisor    | Register/sign in, connect using a learner-issued code, view connected learners' skill scores/history, assign exercises with due dates and notes, remove assignments or connections                            |
| Administrator | Sign in, create/edit/delete exercises, manage sections/questions/options/answer keys/feedback, save drafts or publish, maintain the baseline                                                                  |

Six original exercises across three levels and one eight-question baseline are included. No passage extraction or external content API is required. Sample content is illustrative practice material, not a validated standardized assessment.

## Stack

- React + Vite frontend, responsive CSS, Lucide icons.
- Node.js backend exposed as one Vercel function at `/api/handler`.
- SQLite for local development, using Node's built-in SQLite driver.
- PostgreSQL for hosted multi-user persistence, using `pg`.
- Opaque HTTP-only session cookies; salted scrypt password hashes; server-side scoring and authorization.
- No browser-local database or fake role switcher. Different accounts use the same server database.

## Run locally — Windows PowerShell

Install Node.js **24 LTS** (or a supported Node release >=22.13). Extract this folder and open a terminal in it.

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Open **http://localhost:5173**. The backend uses port 3001. The first local start creates `.data/readora.sqlite` and seeds sample content. The supplied `.env.example` enables local demo accounts:

| Username   | Password        | Role          |
| ---------- | --------------- | ------------- |
| learner    | ReadoraDemo123! | Learner       |
| supervisor | ReadoraDemo123! | Supervisor    |
| admin      | ReadoraDemo123! | Administrator |

On macOS/Linux, use `cp .env.example .env` instead of `Copy-Item`.

You can register fresh learners and supervisors from the interface. Administrative roles are provisioned through database setup, never public registration. Do not use demo accounts for a public deployment.

### Demo walkthrough

1. Sign in as `learner`; complete the baseline.
2. Complete an exercise. Check results, My progress, and Achievements.
3. Repeat that exercise: comprehension changes, XP does not increase.
4. Open My supervisors and generate a connection code.
5. Open a separate browser/private window, sign in as `supervisor`, and enter that code.
6. Assign an exercise, then return to the learner account and complete it. The supervisor sees it marked completed.
7. Sign in as `admin` in another browser context. Use Content manager to create a passage with sections and multiple-choice questions, then publish it.
8. Refresh the learner catalog to see the new exercise.

### Build and test

```powershell
npm test
npm run build
npm start
```

The last command serves the built app at **http://localhost:3001** using the local SQLite database. `npm run dev` is the normal development command. `npm run preview` previews static assets only and is not the full-system test server.

## Host on Vercel with PostgreSQL

Vercel hosting requires a hosted PostgreSQL database; SQLite is intentionally blocked on Vercel because local function files are not the system's durable database.

1. Create a PostgreSQL database with your chosen provider. Obtain its server-side pooled connection string and preserve the provider's TLS parameters.
2. In your local `.env`, set the following. Replace the marked placeholders with real values:

```dotenv
DATABASE_URL=YOUR_POSTGRESQL_CONNECTION_STRING
DEMO_SEED=0
ADMIN_USERNAME=readora_admin
ADMIN_NAME=Readora Administrator
ADMIN_PASSWORD=YOUR_UNIQUE_PASSWORD_OF_AT_LEAST_12_CHARACTERS
```

3. Initialize this remote database once:

```powershell
npm run db:setup
```

This creates the schema, seeds content only when the exercise table is empty, and creates the administrator if its username is not already taken. It does not overwrite existing accounts, passwords, or edited content. Use a fresh administrator username on a new deployment. `server/schema.sql` is also supplied as a schema reference; running only that SQL does not seed content or create the administrator.

4. Push the source to your own Git repository. Keep `.env`, `.data`, and `node_modules` out of Git; `.gitignore` already covers them.
5. Import the repository into Vercel. Use the folder containing `package.json` as the root directory. Set:

| Setting                      | Value                                                  |
| ---------------------------- | ------------------------------------------------------ |
| Framework                    | Vite                                                   |
| Build command                | `npm run build`                                        |
| Output directory             | `dist`                                                 |
| Node.js                      | 24.x                                                   |
| Runtime environment variable | `DATABASE_URL` = the same PostgreSQL connection string |

6. Deploy. The `api/handler.js` entry serves backend requests. `vercel.json` includes API routing. Page navigation uses URL hashes, so refreshes do not require separate page-route rewrites.
7. Sign in using the administrator created in step 3, register a learner and supervisor, and repeat the demo flow with real accounts.

The admin setup password is needed only on your computer for step 3; the deployed app uses the stored hash. **Never prefix `DATABASE_URL` with `VITE_`** or put it in frontend files. Keep credentials out of your public repository.

Use a separate database for preview deployments if you do not want test actions to affect production data. Place your function and database in nearby regions where possible.

Official deployment references:

- https://vercel.com/docs/frameworks/frontend/vite
- https://vercel.com/docs/functions/runtimes/node-js

No Vercel project or external database has been provisioned by this package.

## Learning rules implemented

- Four skills: Literal Understanding, Vocabulary in Context, Main Idea, Inference.
- Skill performance = correct answers / all questions answered for that skill **in completed activities** × 100.
- Overall performance = total correct / total questions across all completed activities.
- Baseline and repeated exercises count in comprehension scores. Incomplete attempts do not count.
- Reading level remains **Not Assessed** until the learner completes the baseline, then follows cumulative performance: below 50% Beginner; 50% to below 75% Intermediate; 75% and above Advanced.
- Displayed percentages are rounded; level cutoffs and weakest-skill comparisons use unrounded ratios.
- Recommendations match current level and include the lowest-performing measured skill. Ties use the listed skill order, and uncompleted exercises are preferred. If no match exists, the dashboard clearly falls back to the general catalog.
- The catalog remains open across all levels.
- Baseline: 50 XP. First completion of each distinct exercise: 30 XP. Repeated completions: 0 XP.
- Player level = 1 + floor(total XP / 100). XP never changes comprehension scores.
- Milestones remain earned even if later scores decrease.
- Completing an assigned exercise after the assignment was created marks it done. A prior completion does not fulfill a newly assigned repeat.

## Data and implementation notes

The schema contains `users`, `sessions`, `exercises`, `attempts`, `rewards`, `achievements`, `invitations`, `connections`, `assignments`, and `rate_limits`.

Exercises store their nested sections/questions as JSON text. Attempts keep independent snapshots and submitted-answer records. Admin edits do not rewrite existing attempts. Deleting an exercise removes its catalog entry but preserves history, XP, and the ability to resume existing attempts. Learners see an unavailable marker for an assignment whose exercise was removed or unpublished.

Finishing an attempt runs in a database transaction. A learner-row lock serializes learner submissions on PostgreSQL. A unique `(user_id, exercise_id)` reward key prevents duplicate XP, even across repeat attempts. Local SQLite requests are serialized through transactions.

Supervisor connections require a learner-generated, expiring, one-use code. Disconnecting removes the connection and its assignments. Supervisors cannot browse unrelated accounts or alter scores. Administrators manage educational content; the UI does not expose individual learner records to them.

All question validation, grading, role checks, and data ownership checks occur on the server. Answer keys are omitted from public catalogs and unsubmitted question responses. Expected answers and explanations are disclosed after submission for learning feedback.

## Initial MVP boundaries

- Username/password sign-in; no email verification, self-service password reset, OAuth, or MFA yet.
- No bulk classroom management, file uploads, AI-generated questions, or automated licensed-text ingestion.
- No email/push deadline reminders or real-time background updates; revisit/refresh a page for changes made by another account.
- No account deletion/export interface or formal content approval workflow yet.
- Question content is English only. These exercises are not normed for an age or school grade.
- Login rate limiting is a basic per-IP-and-username control, not a full abuse prevention service.
- This delivery validates the local runtime. The actual hosted PostgreSQL/Vercel deployment must be smoke-tested after you supply infrastructure.

## Project files

| Location               | Purpose                                                |
| ---------------------- | ------------------------------------------------------ |
| `src/main.jsx`         | Role-based interface, reading flow, editor             |
| `src/styles.css`       | Responsive visual design                               |
| `server/api.js`        | Authentication, permissions, scoring, all workflows    |
| `server/db.js`         | SQLite/PostgreSQL transaction adapters and schema      |
| `server/content.js`    | Original sample passages and question bank             |
| `server/setup.js`      | Database initialization and administrator provisioning |
| `api/handler.js`       | Vercel backend entry point                             |
| `tests/system.test.js` | Integration and scoring tests                          |
| `vercel.json`          | Hosting configuration                                  |

The project rubric concerns a separate paper. This package delivers the initial system and its implementation guide, not a completed academic paper.
