# ── Stage 1: Build React frontend ────────────────────────────
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend-react
COPY frontend-react/package*.json ./
RUN npm ci
COPY frontend-react/ ./
RUN npm run build

# ── Stage 2: Production Node.js server ───────────────────────
FROM node:18-alpine
WORKDIR /app

# Install backend dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy backend source
COPY backend/ ./backend/

# Copy built React assets — Express serves these directly from frontend-react/dist
COPY --from=frontend-build /app/frontend-react/dist ./frontend-react/dist

# Expose API port
EXPOSE 3000

# Run the Express server
CMD ["node", "backend/app.js"]
