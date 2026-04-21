# Laboratorio AYD1 - Seccion A (1S-2026)

Repositorio del laboratorio de Analisis y Diseno de Sistemas 1,
Universidad de San Carlos de Guatemala,
Primer Semestre 2026, Sesion A.

Este espacio esta organizado para ir agregando contenido de diferentes clases.
La estructura esta pensada para que cada carpeta represente un bloque tematico o una clase.

## Estructura actual del repositorio

### Clase8-SOLID/DOCKER

Tema general:

- Aplicacion sencilla con backend y frontend.
- Ejemplo practico de aplicacion de principios SOLID.
- Ejemplo de Docker para construir imagenes y ejecutar contenedores.

Enlaces de referencia:

- Vista general de la clase: [Clase8-SOLID/README.md](Clase8-SOLID/README.md)
- Guia de Docker de la clase: [Clase8-SOLID/GUIA_DOCKER.md](Clase8-SOLID/GUIA_DOCKER.md)
- Orquestacion con Docker Compose: [Clase8-SOLID/docker-compose.yml](Clase8-SOLID/docker-compose.yml)
- Dockerfile backend (multi-stage): [Clase8-SOLID/backend/Dockerfile](Clase8-SOLID/backend/Dockerfile)
- Dockerfile backend (single-stage): [Clase8-SOLID/backend/Dockerfile.single](Clase8-SOLID/backend/Dockerfile.single)
- Vídeo Ejemplo (ejemplo): [https://drive.google.com/drive/folders/1avflzeWsLA2qTuLtxIK5o2xP_fH-otT3?usp=sharing](https://drive.google.com/drive/folders/1avflzeWsLA2qTuLtxIK5o2xP_fH-otT3?usp=sharing)

Desglose del video (Docker):

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

### Ejemplos-SOLID

Tema general:

- Ejemplos cortos por principio SOLID.
- Material de apoyo para explicar casos concretos de diseno.

Enlaces de referencia:

- Guia principal de principios: [Ejemplos-SOLID/README.MD](Ejemplos-SOLID/README.MD)
- SRP: [Ejemplos-SOLID/srp.ts](Ejemplos-SOLID/srp.ts)
- OCP: [Ejemplos-SOLID/open-close-a.ts](Ejemplos-SOLID/open-close-a.ts), [Ejemplos-SOLID/open-close-b.ts](Ejemplos-SOLID/open-close-b.ts)
- LSP: [Ejemplos-SOLID/liskov-a.ts](Ejemplos-SOLID/liskov-a.ts), [Ejemplos-SOLID/liskov-b.ts](Ejemplos-SOLID/liskov-b.ts)
- ISP: [Ejemplos-SOLID/segregation.ts](Ejemplos-SOLID/segregation.ts)
- DIP: [Ejemplos-SOLID/dependency-a.ts](Ejemplos-SOLID/dependency-a.ts), [Ejemplos-SOLID/dependency-b.ts](Ejemplos-SOLID/dependency-b.ts), [Ejemplos-SOLID/dependency-c.ts](Ejemplos-SOLID/dependency-c.ts)

### Pruebas-Unitarias

Tema general:

- Ejemplos practicos de pruebas unitarias e integracion.
- Comparativa de implementacion en Node.js y Python.
- Uso de cobertura para analizar calidad de pruebas.
- Refactorizacion para mejorar testabilidad del codigo.

Enlaces de referencia:

- Vista general del bloque: [Pruebas-Unitarias/README.md](Pruebas-Unitarias/README.md)
- Ejemplo Node (Jest + Supertest): [Pruebas-Unitarias/Ejemplo_Node/README.md](Pruebas-Unitarias/Ejemplo_Node/README.md)
- Ejemplo Python (pytest + FastAPI): [Pruebas-Unitarias/Ejemplo-Python/README.md](Pruebas-Unitarias/Ejemplo-Python/README.md)
- Refactorizacion orientada a testing: [Pruebas-Unitarias/Refactorizacion/README.md](Pruebas-Unitarias/Refactorizacion/README.md)
- Cómo documentar Pruebas unitarias: [Pruebas-Unitarias/Implementacion-proyecto/](Pruebas-Unitarias/Implementacion-proyecto/)
  - [Documentacion-pruebas.md](Pruebas-Unitarias/Implementacion-proyecto/Documentacion-pruebas.md): Tests de AuthService y AppointmentService
- Video Ejemplo (ejemplo): [https://drive.google.com/drive/folders/10lnHa-AMrlNmAP2U9qZzAwogDNZq0GWP?usp=sharing](https://drive.google.com/drive/folders/10lnHa-AMrlNmAP2U9qZzAwogDNZq0GWP?usp=sharing)

Desglose del video (Pruebas Unitarias, Integracion y Coverage):

| Tiempo | Contenido |
|---|---|
| 00:00 | **Introduccion y temas que se abarcan.** |
| 1:15 | **[Node] Explicacion del codigo a testear con inyeccion de dependencias.**<br>- (2:00) Librerias del proyecto.<br>- (3:00) Recorrido de src/authService.js.<br>- (4:40) Recorrido de src/appointmentService.js.<br>- (6:40) Recorrido de src/app.js. |
| 8:50 | **[Node] Pruebas unitarias.**<br>- (10:10) Estructura de una prueba.<br>- (10:40) Que es un Mock.<br>- (15:40) Que es un Fake.<br>- (18:15) Que es un Stub.<br>- (21:30) Ejecucion de pruebas unitarias.<br>- (23:40) Fallo intencional de una prueba.<br>- (25:35) Cobertura de codigo.<br>- (27:00) Reporte HTML de coverage.<br>- (28:30) Como interpretar reportes para detectar codigo sin testear.<br>- (28:50) Vista rapida de integracion de pruebas en despliegue automatico. |
| 32:00 | **[Node] Pruebas de integracion.**<br>- (33:00) Estructura de la prueba de integracion.<br>- (35:50) Ejecucion de pruebas de integracion. |
| 36:40 | **[Python] Pruebas unitarias y de integracion.**<br>- (37:00) Explicacion del codigo (misma app que Node).<br>- (39:40) Ejecucion de pruebas y reporte de cobertura. |
| 40:00 | **Bonus: refactorizacion de codigo con IA (CodeX)**.<br>- (40:50) Como usar la IA integrada en VS Code para refactorizar codigo. |

### Pruebas-end-to-end

Tema general:

- Pruebas End-to-End (E2E) con Cypress.
- Automatizacion de flujos completos de usuarios.
- Pruebas de integracion entre frontend y backend.
- Suite de ejemplos practicos con la app Clase8-SOLID.

Enlaces de referencia:

- Vista general del bloque: [Pruebas-end-to-end/README.md](Pruebas-end-to-end/README.md)
- Configuracion Cypress: [Pruebas-end-to-end/cypress.config.js](Pruebas-end-to-end/cypress.config.js)
- Cómo documentar Pruebas End to End: [Pruebas-end-to-end/Implementacion-proyecto/](Pruebas-end-to-end/Implementacion-proyecto/)
  - [Documentacion-pruebas-E2E.md](Pruebas-end-to-end/Implementacion-proyecto/Documentacion-pruebas-E2E.md): 4 casos de prueba docuemntados
  - Ejemplo de Prueba End to end Enfocada al Proyecto del Laboratorio
- Pruebas E2E ejemplos:
  - [Primera prueba](Pruebas-end-to-end/cypress/e2e/01-primera-prueba.cy.js)
  - [Pruebas de productos](Pruebas-end-to-end/cypress/e2e/02-productos.cy.js)
  - [Pruebas de ordenes](Pruebas-end-to-end/cypress/e2e/03-ordenes.cy.js)
  - [Validaciones](Pruebas-end-to-end/cypress/e2e/04-validaciones.cy.js)
  - [Comandos basicos demo](Pruebas-end-to-end/cypress/e2e/05-comandos-basicos-demo.cy.js)

### CICD

Tema general:

- Ejemplo practico de CI/CD con GitHub Actions para backend y frontend.
- Enfoque por niveles: Nivel 1 (runner GitHub) y Nivel 2 (despliegue en nube).
- Uso de Docker, pruebas unitarias con Jest y despliegue opcional en GCP/Firebase.

Enlaces de referencia:

- Vista general del bloque: [CICD/README.md](CICD/README.md)
- Setup base y demo vista en clase: [CICD/docs/SETUP.md](CICD/docs/SETUP.md)
- Setup completo para nube (GCP/Firebase): [CICD/docs/GCP_SETUP.md](CICD/docs/GCP_SETUP.md)
- Pipelines listos por niveles: [CICD/docs/pipelines-cicd-niveles.md](CICD/docs/pipelines-cicd-niveles.md)
- Workflow activo en el repo: [.github/workflows/backend-ci-cd.yml](.github/workflows/backend-ci-cd.yml)
- Orquestacion local del ejemplo: [CICD/docker-compose.yml](CICD/docker-compose.yml)