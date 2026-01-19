CHT Chat Monorepo

Overview
- Backend: Fastify + MongoDB (`cht-server`)
- Frontend: Next.js (`cht-web`)
- Realtime: WebSocket at `ws://localhost:3333/ws`

Local Setup
1) Backend
- Create `cht-server/.env`:
  - `PORT=3333`
  - `HOST=0.0.0.0`
  - `MONGO_URI=mongodb://localhost:27017/chat`
  - `MONGO_DB_NAME=chat`
  - `JWT_SECRET=change-me`
- Install deps: `npm install`
- Run: `npm run dev`

2) Frontend
- Create `cht-web/.env`:
  - `NEXT_PUBLIC_API_URL=http://localhost:3333`
- Install deps: `npm install`
- Run: `npm run dev`

Docker Setup (Backend + MongoDB)
- Build and run: `docker compose up --build`
- API: `http://localhost:3333`
- Swagger: `http://localhost:3333/docs`

Notes
- Auth uses `Authorization: Bearer <token>` for API + WS.
- WS accepts token via query: `ws://localhost:3333/ws?token=...`
