FROM node:22-slim AS builder
WORKDIR /app
RUN npm install -g pnpm
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/shared ./packages/shared
COPY apps/web/package.json ./apps/web/
RUN pnpm install --frozen-lockfile
COPY apps/web ./apps/web
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN pnpm --filter @archcanvas/web build

FROM nginx:stable-alpine
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
# Create a custom nginx config that listens on 8080 and handles SPA routing
RUN printf "server {\n  listen 8080;\n  location / {\n    root /usr/share/nginx/html;\n    index index.html index.htm;\n    try_files \$uri \$uri/ /index.html;\n  }\n}\n" > /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
