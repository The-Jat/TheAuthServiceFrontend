# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat

# ---------- Install deps ----------
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---------- Build ----------
FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Accept NEXT_PUBLIC_* values as build args and expose them as env vars
# so Next.js can inline them during the build step
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_OAUTH_BASE_URL
ARG NEXT_PUBLIC_OAUTH_LOGIN_ENDPOINT
ARG NEXT_PUBLIC_OAUTH_SIGNUP_ENDPOINT

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_OAUTH_BASE_URL=$NEXT_PUBLIC_OAUTH_BASE_URL
ENV NEXT_PUBLIC_OAUTH_LOGIN_ENDPOINT=$NEXT_PUBLIC_OAUTH_LOGIN_ENDPOINT
ENV NEXT_PUBLIC_OAUTH_SIGNUP_ENDPOINT=$NEXT_PUBLIC_OAUTH_SIGNUP_ENDPOINT

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---------- Production runtime ----------
FROM base AS production
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

COPY --from=build /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]