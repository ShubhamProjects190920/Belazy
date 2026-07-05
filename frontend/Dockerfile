# ─────────────────────────────────────────────
#  Frontend Dockerfile
# ─────────────────────────────────────────────

FROM node:20-alpine

WORKDIR /app

# Install dependencies first (cached layer — only re-runs when package.json changes)
COPY package*.json ./
RUN npm install

# Copy the rest of the frontend source code
COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
