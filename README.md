# Mini Event Management System

This repository contains a mini event management system with two main components:

- **api/**: Laravel PHP backend (API)
- **web/**: Next.js frontend (Web)

---

## Prerequisites

- Node.js (v18+)
- PHP (v11+)
- Composer
- SQLite (or MySQL/Postgres, update `.env` accordingly)
- npm/yarn/pnpm

---

## Folder Structure

- `api/` - Laravel backend API
- `web/` - Next.js frontend

---

## Getting Started

You can use the provided `Makefile` for easy setup and running:

### 1. Setup & Run API (Laravel Backend)

```bash
make backend
```
- Installs PHP dependencies, generates app key, and starts the Laravel server at `http://localhost:8000`.
- Make sure to copy `.env.example` to `.env` in the `api` folder and update DB settings if needed.

### 2. Setup & Run Web (Next.js Frontend)

```bash
make frontend
```
- Installs Node.js dependencies and starts the Next.js server at `http://localhost:3000`.
- Set `NEXT_PUBLIC_API_URL` in `web/.env` to point to your API (e.g., `http://localhost:8000`).

### 3. Clean Dependencies

```bash
make clean
```
- Removes `api/vendor` and `web/node_modules`.

---

## API Endpoints

The main API endpoints for event management are available at `/events`:

- `GET /events` - List all events
- `POST /events` - Create a new event
- `PUT /events/{id}` - Update an event
- `DELETE /events/{id}` - Delete an event
- `POST /events/{event_id}/register` - Register for an event
- `GET /events/{event_id}/attendees` - List attendees for an event
- `PUT /events/{event_id}/attendees/{attendee_id}` - Update attendee
- `DELETE /events/{event_id}/attendees/{attendee_id}` - Remove attendee

---

## Development & Deployment

- Each folder contains its own README for more details.
- You can run both services locally for development.
- For deployment, use Docker or your preferred cloud provider.

---

## License

MIT
