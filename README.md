# MyDoc24.ai

An AI health companion: symptom triage, photo and lab report review, medication information,
a live voice/video AI doctor or nurse, personal health history, public health content, a disease
encyclopedia, lifestyle assessment, and secure (mocked, for now) NHS/Medicaid account linking.

See [PRODUCT_SPEC.md](PRODUCT_SPEC.md) for the full product brief.

## Stack

- Frontend: React + TypeScript (Vite), Tailwind CSS
- Backend: Django + Django REST Framework, JWT auth
- Database: PostgreSQL
- AI: OpenAI, Anthropic, Gemini, ElevenLabs, D-ID, each wired behind an env var and each with a
  graceful mock/demo fallback when its key is absent, so the whole app runs with zero keys configured.

## Running locally

```bash
cp .env.example .env
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/api/
- Backend health check: http://localhost:8000/api/health/
- Django admin: http://localhost:8000/admin/

The first run applies migrations and loads seed data automatically (see `backend/entrypoint.sh`).

Create an admin user once the stack is up:

```bash
docker compose exec backend python manage.py createsuperuser
```

## Enabling real AI providers

Every AI feature works out of the box in "demo mode" with no keys set. To go live with a provider,
add its key to `.env` and restart the backend service:

```
OPENAI_API_KEY=...
ANTHROPIC_API_KEY=...
GEMINI_API_KEY=...
ELEVENLABS_API_KEY=...
DID_API_KEY=...
```

```bash
docker compose restart backend
```

No frontend changes are needed. Responses simply stop being labeled "Demo mode" once a key is active.

## Running tests

```bash
docker compose exec backend pytest
```

## Repository layout

```
backend/    Django project: apps/ (one Django app per feature area), ai/ (provider abstraction)
frontend/   Vite + React app: src/features/ (one folder per feature area), src/components/ui/
```
