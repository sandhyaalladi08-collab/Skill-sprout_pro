# SkillSprout Pro

SkillSprout is an adaptive course-learning portal. It retains the blue-and-white SkillSprout visual identity and adds the technical requirements from the evaluation feedback.

## Features

- Student registration, login, logout and session lookup using bcrypt password hashes and signed HTTP-only cookies.
- Node.js + Express REST API and SQLite persistence.
- Ten preloaded courses, search, category filtering and module details. The browser also has a built-in catalogue preview if the API is temporarily unavailable; enrollment and progress tracking require the server.
- Diagnostic intake based on experience, career goal and selected interests.
- Recommendation scoring using diagnostic answers.
- Directed Acyclic Graph (DAG) prerequisite model.
- Kahn's topological sorting for a valid learning order; cycle detection is included.
- Prerequisite enforcement before enrollment.
- Real module completion and calculated progress (completed modules / total modules).
- Dashboard showing enrollments, completion and average progress.
- Contact form saved through the backend.
- Fetch API learning inspiration section.
- Server-side validation, parameterised SQL, Helmet security headers and rate limiting.

## Requirements

- Node.js 18 or newer
- npm

## Run on Windows / VS Code

1. Extract this ZIP file.
2. Open the `SkillSprout_Pro` folder in VS Code.
3. Open Terminal → New Terminal.
4. Run `npm install`.
5. (Recommended) Copy `.env.example` to a new file named `.env` and set `JWT_SECRET` to a long random secret (at least 32 characters). For local development only, the server now supplies a fallback secret if `.env` is not present.
6. Run `npm start` (or `npm run dev`).
7. Open `http://localhost:3000` in your browser.

**Important:** Always configure a strong, private `JWT_SECRET` before deploying to production. The server refuses to start in production without one.

Do not open `frontend/index.html` directly with file://. Use the running server so the frontend can call the API.

## DAG logic

Each course lists prerequisite course IDs. An edge `A -> B` means course A must be completed before course B. `backend/algorithms/dag.js` builds adjacency and indegree maps and runs Kahn's algorithm. If the output order does not contain every course, a cycle exists. Enrollment is rejected until all prerequisite courses are fully completed.

## Progress logic

The dashboard does not have an artificial progress increment. A student checks off a module; the backend records that module completion in SQLite. Progress is calculated as:

`completed modules / total modules * 100`

The API prevents a student from completing modules in a course they have not enrolled in.

## Main API routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/courses`
- `GET /api/courses/learning-order`
- `GET /api/courses/path/:courseId`
- `GET /api/courses/dashboard`
- `POST /api/courses/:id/enroll`
- `POST /api/courses/:courseId/modules/:moduleId/complete`
- `POST /api/diagnostic`
- `POST /api/contact`
- `GET /api/health`

## Important notes

- This is a working academic project starter, not a production-hosted service. Before public deployment, use HTTPS, set `COOKIE_SECURE=true`, use a strong unique JWT secret, configure backups, add CSRF protection appropriate to your deployment, and review privacy and accessibility requirements.
- The Fetch API learning inspiration uses JSONPlaceholder as a demonstration external API. Replace it with a trusted educational content API if your institution provides one.
- SQLite database is created automatically at `backend/data/skillsprout.sqlite` when the server first starts.
- No real payment, certificate verification, email delivery, or third-party identity provider is claimed.
