.PHONY: dev demo test build clean setup

# Quick start - run everything
dev:
	docker-compose up -d

# Run in demo mode
demo:
	docker-compose --profile demo up -d
	@echo "🚀 Demo starting at http://localhost:3000/demo"

# Run tests
test:
	cd backend && python -m pytest tests/ -v
	cd frontend && npm test

# Build all containers
build:
	docker-compose build

# Clean everything
clean:
	docker-compose down -v
	cd frontend && rm -rf .next node_modules
	cd backend && rm -rf __pycache__ .venv

# Initial setup
setup:
	cp .env.example .env
	cd frontend && npm install
	cd backend && pip install -r requirements.txt
	@echo "✅ Setup complete! Run 'make dev' to start."

# Frontend only
frontend:
	cd frontend && npm run dev

# Backend only
backend:
	cd backend && uvicorn app.main:app --reload --port 8000

# Load synthetic data
load-data:
	cd data/generators && python generate_splunk_data.py
	@echo "✅ Synthetic data generated!"
