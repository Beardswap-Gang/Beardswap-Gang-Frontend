# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

# Config files needed for `next build` (the old Dockerfile only copied
# tsconfig.json, so tailwind/postcss/eslint/next config were all missing
# at build time inside the container).
COPY tsconfig.json next.config.js tailwind.config.ts postcss.config.js .eslintrc.json ./
COPY src ./src

# Build-time env vars must be present for NEXT_PUBLIC_* values to be baked
# into the client bundle. Pass them with --build-arg at `docker build` time.
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_WS_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_WS_URL=${NEXT_PUBLIC_WS_URL}

RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/next.config.js ./

EXPOSE 3000

CMD ["npm", "start"]
