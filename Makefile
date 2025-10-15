# ==================================================
# Makefile to setup and run PHP (Laravel) backend
# and Next.js frontend
# ==================================================

.PHONY: all help backend frontend clean

all: help

help:
	@echo "Usage:"
	@echo "  make backend       # Install PHP dependencies and run Laravel API"
	@echo "  make frontend      # Install Node.js dependencies and run Next.js FE"
	@echo "  make clean         # Remove node_modules and vendor directories"
	@echo ""
	@echo "NOTE: Copy .env.example to .env in both backend and frontend before running."
	@echo "      Backend: ./api/.env"
	@echo "      Frontend: ./web/.env"

backend:
	@echo "=== Setting up Laravel API ==="
	cd api && composer install
	cd api && php artisan key:generate
	@echo "Starting Laravel server at http://localhost:8000"
	cd api && php artisan serve --host=0.0.0.0 --port=8000

frontend:
	@echo "=== Setting up Next.js Frontend ==="
	cd web && npm install
	@echo "Starting Next.js development server at http://localhost:3000"
	cd web && npm run dev

clean:
	@echo "Cleaning dependencies..."
	rm -rf api/vendor
	rm -rf web/node_modules
	@echo "Done."
