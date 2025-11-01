# Base image
FROM node:20-alpine AS base

WORKDIR /app

# Dependencies stage
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# Migration runner stage
FROM base AS migration-runner
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY drizzle.config.ts ./
COPY src/infrastructure/database ./src/infrastructure/database

CMD ["npm", "run", "db:migrate"]

# Builder stage
FROM base AS builder

# Accept build arguments
ARG BETTER_AUTH_SECRET
ARG BETTER_AUTH_URL=http://localhost:3000
ARG DATABASE_URL
ARG PASSKEY_RP_ID
ARG ANTHROPIC_API_KEY

# Set build-time environment variables
ENV NEXT_TELEMETRY_DISABLED=1
ENV BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}
ENV BETTER_AUTH_URL=${BETTER_AUTH_URL}
ENV DATABASE_URL=${DATABASE_URL}
ENV PASSKEY_RP_ID=${PASSKEY_RP_ID}
ENV ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM base AS production

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
