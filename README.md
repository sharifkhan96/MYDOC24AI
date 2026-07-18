# MyDoc24.ai

An AI health companion: symptom triage, photo and lab report review, medication information,
a live voice/video AI doctor or nurse, personal health history, public health content, a disease
encyclopedia, lifestyle assessment, and secure (mocked, for now) NHS/Medicaid account linking.

See [PRODUCT_SPEC.md](PRODUCT_SPEC.md) for the full product brief.

> **Important:** MyDoc24.ai is currently a development/demo application. It is not a substitute
> for professional medical advice, diagnosis, treatment, or emergency services.

## Stack

- Frontend: React + TypeScript (Vite), Tailwind CSS
- Backend: Django + Django REST Framework, JWT auth
- Database: PostgreSQL
- AI: OpenAI, Anthropic, Gemini, ElevenLabs, D-ID, each wired behind an env var and each with a
  graceful mock/demo fallback when its key is absent, so the whole app runs with zero keys configured.

## Prerequisites

- [Git](https://git-scm.com/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) or Docker Engine with the
  Compose plugin

## Running locally

Clone the repository and enter the project directory:

```bash
git clone https://github.com/sharifkhan96/MYDOC24AI.git
cd MYDOC24AI
```

Create your local environment file and start the application:

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

Stop the application with:

```bash
docker compose down
```

## Enabling real AI providers

Every AI feature works out of the box in "demo mode" with no keys set. To go live with a provider,
add its key to `.env` and restart the backend service:

```dotenv
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

The Live doctor page uses D-ID's hosted embed script for the fastest demo path. To point it at a
different D-ID Agent, set:

```dotenv
VITE_DID_CLIENT_KEY=...
VITE_DID_AGENT_ID=...
```

## Running tests

```bash
docker compose exec backend pytest
```

Build and lint the frontend:

```bash
docker compose exec frontend npm run build
docker compose exec frontend npm run lint
```

## Working with the team

Do not commit `.env`, API keys, patient information, or other secrets. The `.env.example` file is
the shared template; each contributor should keep their own local `.env` file.

Create a branch for each change:

```bash
git switch main
git pull origin main
git switch -c feature/short-description
```

Commit and publish the branch:

```bash
git add .
git commit -m "Describe the change"
git push -u origin feature/short-description
```

Then open a pull request on GitHub, ask a teammate to review it, and merge it into `main` after the
checks pass. Contributors need to be added under the repository's **Settings → Collaborators and
teams**, or they can fork the repository and submit pull requests.

## Troubleshooting

View service logs:

```bash
docker compose logs -f
```

Rebuild after changing dependencies:

```bash
docker compose up --build
```

Reset the local development database (this permanently deletes local database data):

```bash
docker compose down -v
docker compose up --build
```

## Repository layout

```text
backend/           Django project, REST API, AI provider abstraction, and scheduler
frontend/          Vite and React application
docker-compose.yml Local multi-service development environment
.env.example       Environment variable template (safe to commit)
PRODUCT_SPEC.md    Full product brief
```
