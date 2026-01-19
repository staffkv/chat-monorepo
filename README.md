CHT Chat Monorepo

Overview
- Backend: Fastify + MongoDB (`cht-server`)
- Frontend: Next.js (`cht-web`)
- Realtime: WebSocket at `ws://localhost:3333/ws`

Step-by-step: MongoDB + Backend (Local)
1) Start MongoDB
- Option A (Docker):
  - `docker run --name chat-mongo -p 27017:27017 -d mongo:7`
- Option B (Local install):
  - Start your local MongoDB service on `mongodb://localhost:27017`
- Option C (Usar my config Mongo Online):
 - Using .env MONGO_URI=mongodb+srv://chatrepo:chatrepodb@cluster01.xwlnz8l.mongodb.net/?appName=cluster01

2) Configure backend env
- Create `cht-server/.env`:
  - `PORT=3333`
  - `HOST=0.0.0.0`
  - `MONGO_URI=mongodb://localhost:27017/chat`
  - `MONGO_DB_NAME=chat`
  - `JWT_SECRET=change-me`

3) Install and run backend
- `cd cht-server`
- `npm install`
- `npm run dev`

4) Validate backend
- API: `http://localhost:3333`
- Swagger: `http://localhost:3333/docs`

Step-by-step: Frontend (Local)
1) Configure frontend env
- Create `cht-web/.env`:
  - `NEXT_PUBLIC_API_URL=http://localhost:3333`

2) Install and run frontend
- `cd cht-web`
- `npm install`
- `npm run dev`

Docker Compose (MongoDB + Backend)
1) `docker compose up --build`
2) API: `http://localhost:3333`
3) Swagger: `http://localhost:3333/docs`

Notes
- Auth uses `Authorization: Bearer <token>` for API + WS.
- WS accepts token via query: `ws://localhost:3333/ws?token=...`

- .env server
MONGO_URI=mongodb+srv://chatrepo:chatrepodb@cluster01.xwlnz8l.mongodb.net/?appName=cluster01
PORT=3333
HOST=0.0.0.0
MONGO_DB_NAME=chatrepodb
JWT_SECRET=chat-monorepo-secret


- env web
NEXT_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3333
