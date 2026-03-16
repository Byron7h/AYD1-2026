# Etapa 1: builder
# Aqui se instala todo (incluyendo herramientas de build)
# y se compila TypeScript a JavaScript.
FROM node:20-alpine AS builder

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos manifiestos primero para aprovechar cache de dependencias
COPY package*.json tsconfig.json ./

# Prisma schema necesario para generar cliente
COPY prisma ./prisma/

# Instalamos dependencias y generamos cliente Prisma
RUN npm ci && npx prisma generate

# Copiamos codigo fuente y compilamos
COPY src ./src
RUN npm run build

# Etapa 2: runtime final
# Solo se copia lo necesario para ejecutar la app.
FROM node:20-alpine AS production
WORKDIR /app

# Instalamos solo dependencias de produccion
COPY package*.json ./
RUN npm ci --omit=dev

# Copiamos artefactos minimos desde builder
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/dist ./dist
COPY prisma ./prisma/

# Puerto que expone la API
EXPOSE 3000

# Comando de inicio del contenedor
CMD ["node", "dist/index.js"]
