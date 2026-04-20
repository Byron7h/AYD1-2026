# SETUP de la demo CI/CD

## 1) Correr el proyecto localmente

Variables de entorno:

- Backend: copiar `CICD/backend/.env.example` a `.env` y definir `DATABASE_URL` y `PORT`
- Frontend: copiar `CICD/frontend/.env.example` a `.env` y definir `VITE_API_URL`

Opcion A (comandos npm):

1. Backend:
   - `cd CICD/backend`
   - `npm install`
   - `npm start`
2. Frontend (en otra terminal):
   - `cd CICD/frontend`
   - `npm install`
   - `npm run dev`

Verificacion:

- Abrir `http://localhost:3000/health`
- Debe responder un JSON con `status: "ok"` y `timestamp`

## 2) Nivel 1 - Pipeline basico en el runner

- No requiere configuracion extra de secrets
- Hacer push a `main`
- Revisar ejecucion en GitHub Actions

Comportamiento esperado:

- Se ejecuta Build -> Test -> Deploy
- El backend corre temporalmente dentro del runner
- Al terminar el job, ese backend desaparece (no queda publico en internet)

## 3) Nivel 2 - Deploy real a GCP Cloud Run

Paso a paso:

1. Habilitar APIs en GCP:
   - Cloud Run API
   - Container Registry API
2. Crear Service Account con permisos:
   - Cloud Run Admin
   - Storage Admin
   - Service Account User
3. Descargar el JSON de la key de esa Service Account
4. Agregar secrets en GitHub:
   - `GCP_PROJECT_ID`
   - `GCP_SA_KEY`
   - `DATABASE_URL`
5. En `.github/workflows/backend-ci-cd.yml`:
   - Comentar el bloque Nivel 1 del job `deploy`
   - Descomentar el bloque Nivel 2
6. Hacer push a `main` y validar deploy en Cloud Run

## 4) Deploy del frontend en Firebase Hosting

1. Crear proyecto en Firebase Console (o usar el mismo proyecto de GCP)
2. Habilitar Firebase Hosting
3. Crear Service Account con permisos de Firebase Hosting
4. Agregar secrets en GitHub:
   - `FIREBASE_SERVICE_ACCOUNT`
   - `GCP_PROJECT_ID`
5. Configurar `VITE_API_URL` con la URL publica de Cloud Run
6. Hacer push a `main`

## 5) Demo en vivo - instrucciones exactas

CAMBIO A REALIZAR:
  Archivo : CICD/frontend/src/LoginPage.jsx
  Buscar  : backgroundColor: '#2563EB'
  Cambiar : backgroundColor: '#16A34A'
  (azul -> verde)

  O tambien cambiar el titulo:
  Buscar  : "CI/CD Demo"
  Cambiar : "CI/CD Demo v2.0"

COMANDOS:
  git add .
  git commit -m "feat: cambio visual para demo CI/CD"
  git push origin main

VER EL PIPELINE:
  https://github.com/TU_USUARIO/TU_REPO/actions
