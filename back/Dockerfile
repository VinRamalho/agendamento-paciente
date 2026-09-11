# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
WORKDIR /app

# Camada de deps — cacheada enquanto package-lock.json não mudar
FROM base AS deps
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

# Desenvolvimento (target usado pelo docker-compose)
FROM deps AS development
COPY . .
EXPOSE 3333
CMD ["npm", "run", "start:dev"]

# Build para produção
FROM deps AS build
COPY . .
RUN npm run build \
  && npm prune --omit=dev

# Produção — imagem mínima
FROM base AS production
ENV NODE_ENV=production
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
EXPOSE 3333
CMD ["node", "dist/main.js"]
