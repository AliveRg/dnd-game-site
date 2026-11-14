# ---------- Сборка ----------
# lts = последняя LTS-версия Node.js на момент сборки
FROM node:lts-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund --ignore-scripts

COPY . .
RUN npm run build

# ---------- Продакшен ----------
FROM node:lts-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000 \
    NITRO_PORT=3000

# Nitro собирает всё нужное (включая node_modules) в .output
COPY --from=build /app/.output ./.output

USER node

# App Platform (Timeweb) берёт порт из EXPOSE и сам вешает nginx + SSL на 80/443
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1

CMD ["node", ".output/server/index.mjs"]
