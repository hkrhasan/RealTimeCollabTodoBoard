# Stage 1: Build your Node+TypeScript app with pnpm
FROM node:20-alpine AS builder

# Enable pnpm via Corepack
RUN corepack enable \
  && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy manifests & lockfile, install deps
COPY package.json pnpm-lock.yaml tsconfig.json ./
RUN pnpm install --frozen-lockfile

# Copy source & compile
COPY src/ src/
RUN pnpm run build

# Stage 2: Create a slim production image
FROM node:20-alpine AS runtime

# We still need pnpm to pull only prod deps
RUN corepack enable \
  && corepack prepare pnpm@latest --activate

WORKDIR /app

# Install only production deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

# Copy compiled output
COPY --from=builder /app/dist ./dist

# Expose whatever port your app listens on
ENV PORT=4000
EXPOSE 4000

# Launch your built server
CMD ["node", "dist/index.js"]
