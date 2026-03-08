.PHONY: dev web api db migrate seed test clean

# Start everything
dev: db api web

# Database
db:
	docker compose -f infra/docker-compose.yml up -d

db-stop:
	docker compose -f infra/docker-compose.yml down

db-reset:
	docker compose -f infra/docker-compose.yml down -v
	docker compose -f infra/docker-compose.yml up -d

# Backend
api:
	cd apps/api && uv run uvicorn app.main:app --reload --port 8000

# Frontend
web:
	pnpm --filter @darkknight/web dev

# Migrations
migrate:
	cd apps/api && uv run alembic upgrade head

migrate-new:
	cd apps/api && uv run alembic revision --autogenerate -m "$(msg)"

# Seed
seed:
	cd apps/api && uv run python -m scripts.seed

# Tests
test:
	cd apps/api && uv run pytest

# Install
install:
	pnpm install
	cd apps/api && uv sync

# Clean
clean:
	rm -rf node_modules apps/web/node_modules apps/web/.next
	rm -rf apps/api/.venv packages/optimizer/build
