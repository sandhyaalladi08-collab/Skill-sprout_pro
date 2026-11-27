# Course Feedback Analyzer — Submission & Demonstration Guide

## Project contents
This submission contains three complementary parts:
- `cli/`: standalone Python terminal application for collecting, validating, searching, analysing, importing and exporting course feedback.
- `backend/`: Python FastAPI REST API with account registration, JWT authentication, per-user feedback isolation and analytics.
- `src/`: original React + TypeScript web interface backed by Supabase.

**Architecture note:** the React interface continues to use Supabase directly. The FastAPI service is a separately runnable Python API, and the CLI is a separate local application. They are not one fully integrated login/data pipeline.

## Recommended live demonstration (5–7 minutes)
1. Show the project structure and explain the CLI, API and web interface.
2. Run the CLI and load its sample data: `cd cli` then `python main.py`.
3. Demonstrate adding feedback and show validation by entering an invalid rating.
4. Show the executive summary, warnings, search and chart/report export.
5. Demonstrate bulk CSV import with `data/sample_import_with_errors.csv`.
6. Start the API, open `/docs`, register a test account, authorize with the returned bearer token, create feedback and open `/analytics`.
7. Run both test suites and show the actual results.

## Run the Python CLI (Windows PowerShell)
```powershell
cd cli
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python main.py
```
If `py` is not recognized, use `python` in place of `py`.

## Run the Python API (Windows PowerShell)
```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```
Generate a private key:
```powershell
py -c "import secrets; print(secrets.token_urlsafe(48))"
```
Put the generated value after `SECRET_KEY=` in `backend/.env`, then run:
```powershell
uvicorn app.main:app --reload
```
Open `http://127.0.0.1:8000/docs` in your browser. Do not paste that URL into PowerShell; it belongs in the browser address bar.

## Run tests
CLI tests:
```powershell
cd cli
python -m unittest discover -s tests -v
```
Backend tests:
```powershell
cd backend
pytest -q
```

## Run the existing web interface (optional)
Install Node.js 20+ and npm, then from the project root run `npm install`. Create a local `.env` using `.env.example` and your own Supabase project URL and anon key. Apply the SQL migration in `supabase/migrations/` to that Supabase project, then run `npm run dev`.
The frontend cannot connect to a real Supabase project until valid project credentials and the migration are supplied. Never commit a real `.env` file or service-role key.

## Submission checklist
- [ ] Submit the complete project folder or ZIP, not only screenshots.
- [ ] Keep `backend/.env` and root `.env` out of the ZIP.
- [ ] Include `backend/.env.example` and root `.env.example`.
- [ ] Run the CLI tests and backend tests on the submission machine.
- [ ] Start the API and verify `/health` and `/docs`.
- [ ] Use sample/test data only in the classroom demonstration.
- [ ] Be ready to explain validation, persistence, analytics, authentication and tests.
- [ ] Replace team/member details in your presentation/report with the exact names requested by your institution.

## Honest scope statement for viva
The CLI is a standalone Python implementation. The FastAPI backend is an independently runnable authenticated API. The React frontend remains connected to Supabase; it has not yet been migrated to FastAPI. This separation is intentional and documented.
