# UI Upgrade Notes

This upgrade preserves the existing Course Feedback Analyzer features and adds a polished, Streamlit-inspired analytics workspace.

## UI improvements
- Added a responsive hero workspace with clear product positioning and quick actions to submit feedback or explore analytics.
- Refined the visual system with a deep navy/teal palette, glass-like navigation, improved typography, spacing, and responsive behavior.
- Improved the visual hierarchy of existing dashboard cards, charts, forms, tables, and data surfaces without removing existing navigation or workflows.

## Existing functionality retained
Dashboard, record explorer/search, feedback submission and validation, analytics, bulk import, reports/export, Supabase integration, Python CLI, FastAPI backend, sample datasets, and tests remain in the project.

## Run the web app
1. Install Node.js 20+.
2. From this folder run `npm install`.
3. Configure `.env` using `.env.example` and your Supabase project credentials.
4. Run `npm run dev`.

The web frontend still requires a configured Supabase project as described in `SUBMISSION_GUIDE.md`. The CLI and FastAPI backend remain independently runnable.
