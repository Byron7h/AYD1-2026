# SOLID Orders - Guia para Estudiantes

Proyecto de apoyo para aprender y comparar los principios SOLID con ejemplos practicos en Node.js, TypeScript, Prisma y Docker.

## Objetivo de aprendizaje

Este proyecto esta preparado para estudiar cada principio con la estructura:

- ANTES: codigo funcional, pero con problemas de diseno.
- DESPUES: refactor aplicado para resolver ese problema.

La meta no es memorizar definiciones, sino entender:

- que problema detecta cada principio,
- que cambio concreto se aplica,
- y que mejora se obtiene en mantenibilidad.

## Tecnologias usadas

- Backend: Express + TypeScript
- ORM: Prisma
- Base de datos: PostgreSQL (Neon)
- Frontend: React + Vite
- Contenedores: Docker + docker-compose

## Estructura didactica por principio

| Archivo foco | Principio | Idea principal |
|---|---|---|
| backend/src/controllers/OrderController.ts | S | Una clase no debe mezclar validacion, negocio, persistencia y notificacion |
| backend/src/repositories/OrderRepository.ts | O | El codigo debe poder extenderse sin modificar bloques estables |
| backend/src/services/PaymentProcessors.ts | L | Cualquier implementacion debe sustituir a otra si cumple el mismo contrato |
| backend/src/interfaces/index.ts | I | Cada cliente debe depender solo de las operaciones que usa |
| backend/src/index.ts | D | Las capas de negocio dependen de abstracciones, no de detalles concretos |

## Como ejecutar el proyecto

### Opcion 1: ejecucion local

```bash
# 1) Configurar variables de entorno
cp .env.example .env
# Completar DATABASE_URL

# 2) Backend
cd backend
npm install
npx prisma db push
npm run dev

# 3) Frontend (otra terminal)
cd ../frontend
npm install
npm run dev
```

### Opcion 2: con Docker

```bash
cp .env.example .env
# Completar DATABASE_URL

docker-compose up --build
```

## Endpoints principales

| Metodo | Endpoint | Uso |
|---|---|---|
| GET | /health | Verificar que el backend esta activo |
| GET | /products | Listar productos |
| POST | /products | Crear producto |
| GET | /orders | Listar ordenes (con filtros opcionales) |
| POST | /orders | Crear orden |
| POST | /orders/:orderId/payment | Procesar pago de una orden |

### Ejemplo de body: crear producto

```json
{ "name": "Laptop", "price": 1500, "stock": 10 }
```

### Ejemplo de body: crear orden

```json
{
  "customerEmail": "student@example.com",
  "items": [{ "productId": 1, "quantity": 2 }]
}
```

### Ejemplo de body: pagar orden

```json
{ "paymentMethod": "credit_card", "cardNumber": "1234567890123456" }
```

Tambien se puede pagar con:

- PayPal: `{ "paymentMethod": "paypal", "paypalEmail": "x@y.com" }`
- Crypto: `{ "paymentMethod": "crypto", "wallet": "0xABC..." }`

## Ruta sugerida de estudio

1. Estudiar primero la version ANTES del archivo foco.
2. Identificar el problema principal de diseno.
3. Revisar la version DESPUES y el cambio aplicado.
4. Relacionar el cambio con el principio SOLID correspondiente.
5. Probar endpoints para observar que el comportamiento funcional se mantiene.

## Resumen rapido de cada principio

### S - Single Responsibility

Una clase debe tener una sola razon para cambiar.

Senal de alerta: un metodo hace demasiadas cosas (validar, calcular, guardar, notificar).

### O - Open/Closed

El codigo debe abrirse a extension sin modificar lo que ya funciona.

Senal de alerta: cadenas de if/else que crecen cada vez que aparece un requisito nuevo.

### L - Liskov Substitution

Si dos clases implementan el mismo contrato, deben poder reemplazarse sin romper el sistema.

Senal de alerta: no hay contrato comun y cada implementacion devuelve estructuras distintas.

### I - Interface Segregation

Una clase no debe implementar metodos que no necesita.

Senal de alerta: interfaces gigantes con operaciones mezcladas de lectura y escritura.

### D - Dependency Inversion

La logica de negocio debe depender de abstracciones, no de detalles de infraestructura.

Senal de alerta: servicios que hacen `new PrismaClient()` o `new NotificationService()` internamente.

## Idea clave para evaluacion

El proyecto mantiene comportamiento funcional mientras mejora:

- legibilidad,
- facilidad de prueba,
- capacidad de extension,
- y desacoplamiento entre capas.

Eso es el objetivo central de aplicar SOLID en un sistema real.

## Video de apoyo (Docker) y desglose por tiempo

Video:

- Video Ejemplo (Docker): [https://drive.google.com/drive/folders/1avflzeWsLA2qTuLtxIK5o2xP_fH-otT3?usp=sharing](https://drive.google.com/drive/folders/1avflzeWsLA2qTuLtxIK5o2xP_fH-otT3?usp=sharing)

Desglose del contenido del video:

| Tiempo | Contenido |
|---|---|
| 0:40 | Demostracion del proyecto ejecutandose en el host. |
| 1:30 | Definicion de conceptos y terminos generales de Docker. |
| 2:00 | Introduccion a Dockerfiles y construccion de imagenes. |
| 7:40 | Uso de Dockerfiles multi-etapa y generacion de imagenes optimizadas. |
| 12:10 | Comparacion entre imagenes de una sola etapa y multi-etapa. |
| 12:45 | Uso de archivo .dockerignore para excluir archivos en la construccion. |
| 15:10 | Creacion y gestion de contenedores. |
| 17:50 | Introduccion a Docker Compose como herramienta de orquestacion. |
| 22:00 | Ejecucion de servicios mediante Docker Compose. |
| 23:40 | Demostracion del proyecto ejecutandose desde contenedores Docker. |
