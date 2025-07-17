# Stage 1: Build Vite with pnpm
FROM node:20-alpine AS builder

# enable Corepack and pnpm
RUN corepack enable \
  && corepack prepare pnpm@latest --activate

WORKDIR /app

# copy package manifest and pnpm lockfile
COPY package.json pnpm-lock.yaml ./

# install dependencies with pnpm
RUN pnpm install --frozen-lockfile

# copy rest of the source & build
COPY . .
RUN pnpm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# your custom nginx.conf (with any socket‑proxying if needed)
COPY nginx.conf /etc/nginx/nginx.conf

# copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
