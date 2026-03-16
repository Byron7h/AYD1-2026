# Etapa 1: build de React/Vite
FROM node:20-alpine AS builder

# Directorio interno
WORKDIR /app

# Dependencias primero para cache
COPY package*.json ./
RUN npm ci

# Codigo frontend y compilacion a dist/
COPY . .
RUN npm run build

# Etapa 2: runtime con Nginx
FROM nginx:alpine AS production

# Copiamos archivos estaticos compilados
COPY --from=builder /app/dist /usr/share/nginx/html

# Config de Nginx con proxy /api hacia backend
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Puerto HTTP de Nginx
EXPOSE 80

# Nginx en foreground para mantener vivo el contenedor
CMD ["nginx", "-g", "daemon off;"]
