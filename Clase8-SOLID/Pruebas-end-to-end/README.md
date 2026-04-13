# Pruebas End-to-End con Cypress - Clase8-SOLID

Este directorio contiene un ejemplo completo de pruebas end-to-end (E2E) usando Cypress sobre la app de Clase8-SOLID (frontend + backend).

## Objetivo

Aprender Cypress de menos a mas:

1. Abrir la aplicacion y validar elementos base.
2. Crear un producto desde la UI.
3. Ejecutar un flujo real de usuario (crear producto y luego una orden).
4. Probar validaciones y errores de negocio.

## Que es una prueba end-to-end

Una prueba end-to-end valida un flujo completo del sistema desde la perspectiva del usuario final, atravesando interfaz, API y base de datos.

Frase clave para clase:

Cypress controla el navegador como si fuera un usuario real.

## Flujos detectados en este proyecto

Luego de analizar la app, estos son los flujos mas utiles para E2E:

1. Navegar entre pestanas de Ordenes y Productos.
2. Crear un producto (nombre, precio, stock) y verlo en la tabla.
3. Crear una orden seleccionando producto existente.
4. Validar errores por formulario incompleto.
5. Validar error de stock insuficiente.

## Pre-requisitos

1. Node.js 18+.
2. Proyecto base ejecutandose (frontend en 5173 y backend en 3000).
3. Variables de entorno configuradas segun .env.example en la raiz de Clase8-SOLID.

## Como correr el proyecto base

En la carpeta Clase8-SOLID:

Opcion local:

1. Backend
   cd backend
   npm install
   npx prisma db push
   npm run dev

2. Frontend (en otra terminal)
   cd frontend
   npm install
   npm run dev

Opcion Docker:

1. cd Clase8-SOLID
2. docker-compose up --build

La aplicacion queda disponible en http://localhost:5173.

## Instalacion de Cypress

Ubicate en la carpeta pruebas end-to-end y ejecuta:

1. npm init -y
2. npm install cypress --save-dev
3. npx cypress open

Explicacion corta de cada comando:

1. npm init -y
   Crea un package.json inicial con valores por defecto.

2. npm install cypress --save-dev
   Instala Cypress como dependencia de desarrollo. No va a produccion.

3. npx cypress open
   Abre la interfaz grafica de Cypress para ejecutar pruebas visualmente.

Nota: este repositorio ya incluye package.json en esta carpeta, asi que para la clase normalmente basta con npm install y luego npx cypress open.

## Estructura de archivos de Cypress

- cypress.config.js: configuracion global (baseUrl, timeouts, etc).
- cypress/e2e: specs de pruebas.
- cypress/support/e2e.js: arranque de soporte.
- cypress/support/commands.js: comandos personalizados (getByDataCy).

## Tests incluidos (de menos a mas)

1. 01-primera-prueba.cy.js
   Visita la app y confirma que carga correctamente.

2. 02-productos.cy.js
   Crea un producto desde la interfaz y valida que aparece en la tabla.

3. 03-ordenes.cy.js
   Flujo real completo: crea producto, luego crea orden con ese producto.

4. 04-validaciones.cy.js
   Casos negativos: campos incompletos y stock insuficiente.

## Comandos basicos de Cypress explicados

1. cy.visit(url)
   Navega a una URL.

2. cy.contains(texto)
   Busca un elemento por texto visible.

3. cy.click()
   Simula clic del usuario.

4. cy.get(selector)
   Selecciona elementos por CSS.

5. cy.type(texto)
   Escribe en inputs.

6. cy.select(valor)
   Selecciona una opcion en un select.

## Scripts utiles

En pruebas end-to-end:

1. npm run cy:open
   Abre interfaz de Cypress.

2. npm run cy:run
   Ejecuta todos los tests en modo headless.

3. npm run cy:headed
   Ejecuta tests mostrando navegador.

4. npm run test:e2e
   Ejecuta tests en Chrome.

## Buenas practicas aplicadas

1. Tests pequenos y con un objetivo claro.
2. Selectores estables con data-cy para evitar fragilidad.
3. Datos dinamicos con Date.now() para evitar colisiones.
4. Casos felices y casos negativos.
5. Comentarios dentro del test para facilitar explicacion en clase.

## Como ejecutar las pruebas

1. Asegurate de tener backend y frontend levantados.
2. Abre una terminal en pruebas end-to-end.
3. Ejecuta npm install.
4. Ejecuta npm run cy:open para demo interactiva o npm run cy:run para ejecucion completa.

## Tip para la clase

Empieza con 01-primera-prueba.cy.js y luego avanza gradualmente hasta 04-validaciones.cy.js.
Asi el grupo ve progreso real y entiende para que sirve cada comando.
