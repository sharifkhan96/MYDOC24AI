#!/bin/sh
set -e

echo "Waiting for postgres at ${POSTGRES_HOST}:${POSTGRES_PORT}..."
until pg_isready -h "${POSTGRES_HOST}" -p "${POSTGRES_PORT}" -U "${POSTGRES_USER}" > /dev/null 2>&1; do
  sleep 1
done
echo "Postgres is up."

python manage.py migrate --noinput
for fixture in seed_personas seed_medications seed_encyclopedia seed_bulletins seed_meditation_guides; do
  python manage.py loaddata "$fixture" 2>/dev/null || true
done
python manage.py generate_avatar_portraits || true

echo "Starting Django dev server."
exec python manage.py runserver 0.0.0.0:8000
