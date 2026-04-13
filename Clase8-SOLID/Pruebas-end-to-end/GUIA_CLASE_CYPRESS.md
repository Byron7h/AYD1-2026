# Guia para impartir clase: Cypress E2E (Clase8-SOLID)

Duracion sugerida: 90 minutos
Publico objetivo: estudiantes con base en frontend/backend

## 0. Ruta exacta y preparacion de terminales

Antes de empezar clase, abre 3 terminales:

1. Terminal Backend
   Carpeta: Clase8-SOLID/backend
   Comandos:
   npm install
   npx prisma db push
   npm run dev

2. Terminal Frontend
   Carpeta: Clase8-SOLID/frontend
   Comandos:
   npm install
   npm run dev

3. Terminal Cypress
   Carpeta: Clase8-SOLID/Pruebas-end-to-end
   Comandos:
   npm install
   npx cypress open

Texto literal para decir:

Ahora voy a tener 3 procesos vivos: backend, frontend y Cypress. Si backend o frontend no estan arriba, el E2E no puede correr porque no tendria app que probar.

## 0.1 Que deben configurar tus companeros (texto literal)

Di esto al inicio:

Antes de escribir una sola prueba, todos deben verificar: Node instalado, backend arriba, frontend arriba y carpeta correcta de Cypress.

Checklist para proyectar en clase:

1. Node 18+.
2. Backend en [http://localhost:3000](http://localhost:3000).
3. Frontend en [http://localhost:5173](http://localhost:5173).
4. Carpeta de trabajo: Clase8-SOLID/Pruebas-end-to-end.
5. npm install ejecutado en las 3 carpetas (backend, frontend, Pruebas-end-to-end).

## 0.2 Que fue lo que le movimos al proyecto (texto literal)

Di esto:

Para habilitar E2E estable, hicimos cambios concretos en tres zonas: configuracion Cypress, pruebas E2E y selectores data-cy en frontend.

Detalle para explicar:

1. Configuracion Cypress en cypress.config.js.
2. Comandos compartidos en cypress/support.
3. Specs en cypress/e2e.
4. Selectores data-cy en frontend/src/App.tsx.

## 0.3 Que comando uso y que hace (texto literal)

1. npm run cy:open
   Abre Cypress Launchpad.

2. npm run cy:open:chrome
   Abre Launchpad intentando usar Chrome.

3. npm run test:e2e
   Corre toda la suite en Chrome.

4. npm run demo:01
   Corre solo la prueba 01 para demo de inicio.

5. npm run demo:02
   Corre solo la prueba de productos.

6. npm run demo:03
   Corre solo el flujo completo de orden.

7. npm run demo:04
   Corre casos negativos.

8. npm run demo:05
   Corre laboratorio de comandos basicos.

## 1. Apertura (5 min)

Texto literal:

Hoy vamos a validar el sistema como un usuario real. No solo una funcion aislada, sino todo el flujo: interfaz, API y base de datos.

Objetivo de la sesion:

1. Entender que es Cypress.
2. Instalar Cypress en vivo.
3. Crear y ejecutar pruebas E2E de menos a mas.
4. Explicar comandos basicos y buenas practicas.

## 2. Introduccion a Cypress (15 min)

Texto literal:

Cypress es un framework para probar aplicaciones web. Su fuerte son pruebas end-to-end. La ventaja es que vemos la ejecucion en navegador y detectamos regresiones reales del usuario final.

Frase clave:

Cypress controla el navegador como si fuera un usuario real.

Pregunta que suele salir en clase:

Es solo para Node?

Respuesta:

No. Cypress sirve para apps web en general (React, Vue, Angular, HTML/JS). Node se usa para instalar y ejecutar Cypress, pero la prueba es contra el navegador.

## 3. Instalacion en vivo (10-15 min)

Comandos:

1. npm init -y
2. npm install cypress --save-dev
3. npx cypress open

Texto literal para explicar:

1. npm init -y crea package.json.
2. npm install cypress --save-dev instala Cypress como dependencia de desarrollo.
3. npx cypress open abre la interfaz visual para ejecutar specs.

Explicacion de node_modules dentro de esta carpeta:

Es normal. node_modules aparece en la carpeta donde ejecutas npm install. Como instalamos en Pruebas-end-to-end, el node_modules queda ahi.

## 4. Explicacion de la configuracion y soporte (10 min)

### cypress.config.js

Texto literal:

Aqui centralizamos la configuracion de Cypress. Lo clave es baseUrl: [http://localhost:5173](http://localhost:5173). Por eso en los tests usamos cy.visit("/") y no toda la URL completa.

Puntos a explicar:

1. baseUrl
   URL base para cy.visit("/").
2. specPattern
   Donde busca los archivos .cy.js.
3. supportFile
   Archivo que se carga antes de cada spec.
4. defaultCommandTimeout
   Tiempo maximo de espera por comando.
5. viewportWidth y viewportHeight
   Tamano del navegador de prueba.

### cypress/support/e2e.js

Texto literal:

Este archivo se ejecuta antes de cada prueba. Es el punto para cargar configuraciones globales y comandos compartidos.

### cypress/support/commands.js

Texto literal:

Aqui definimos comandos personalizados. Creamos getByDataCy para seleccionar por data-cy y hacer pruebas mas estables.

## 5. Explicacion de cambios en frontend (8 min)

Archivo impactado: frontend/src/App.tsx

Texto literal:

Para que Cypress sea estable, agregamos atributos data-cy en botones, inputs, selects, tablas y mensajes de error. Asi evitamos depender de estilos o textos que cambian facil.

Selectores agregados:

1. tab-orders, tab-products
2. product-name, product-price, product-stock, create-product
3. order-email, order-product, order-qty, create-order
4. products-table, orders-table
5. error-message, close-error
6. refresh-data

## 6. Explicacion de cada prueba (20-25 min)

### 01-primera-prueba.cy.js

Texto literal:

Este es el smoke test. Solo valida que la app abre y que los elementos principales existen.

Que ensenas:

1. describe e it
2. cy.visit
3. cy.contains
4. cy.getByDataCy

Texto literal extra para esta prueba:

Esta prueba no valida negocio complejo, valida que el sistema esta vivo y renderiza componentes clave.

### 02-productos.cy.js

Texto literal:

Aqui ya hacemos accion real: crear producto desde UI y confirmar resultado en la tabla.

Que ensenas:

1. click para navegar
2. type para llenar formulario
3. asercion visual de exito

Texto literal extra para esta prueba:

Aqui ya validamos una accion de usuario con impacto real: crear y visualizar datos nuevos.

### 03-ordenes.cy.js

Texto literal:

Este es el flujo E2E principal de negocio. Primero creo producto, luego creo una orden usando ese producto.

Que ensenas:

1. Encadenar pasos reales de usuario
2. Seleccionar option dinamico en select
3. Validar resultado final en tabla

Texto literal extra para esta prueba:

Este es el ejemplo estrella porque recorre el flujo de negocio de punta a punta.

### 04-validaciones.cy.js

Texto literal:

No todo es camino feliz. Aqui probamos errores: formulario incompleto y stock insuficiente.

Que ensenas:

1. Casos negativos
2. Aserciones sobre mensajes de error

Texto literal extra para esta prueba:

No solo probamos que funcione; tambien probamos que falle de forma controlada.

### 05-comandos-basicos-demo.cy.js

Texto literal:

Este spec esta pensado como laboratorio rapido para repasar visit, contains, click, get, type y select.

Texto literal extra para esta prueba:

Esta prueba sirve para practicar sintaxis de Cypress sin distraernos con reglas complejas de negocio.

## 7. Bloque especifico de comandos basicos (15 min)

Texto literal corto por comando:

1. cy.visit()
   Navega a una ruta de la app.

2. cy.contains()
   Busca por texto visible.

3. cy.click()
   Simula clic de usuario.

4. cy.get()
   Selecciona por CSS.

5. cy.type()
   Escribe en inputs.

6. cy.select()
   Escoge opcion en select.

## 8. Como ejecutar en Cypress UI (muy importante)

Texto literal:

Si Cypress abre y parece que no pasa nada, no es error. Debes entrar a E2E Testing y hacer clic en un archivo .cy.js para correrlo.

Secuencia exacta en la ventana de Cypress:

1. E2E Testing
2. Browser (Chrome o Electron)
3. Start E2E Testing
4. Clic en 01-primera-prueba.cy.js

## 9. Troubleshooting rapido (cuando algo falla)

1. Cypress abre pero tests fallan en visit
   Verifica frontend en [http://localhost:5173](http://localhost:5173).

2. Se crean errores al crear orden
   Verifica backend en [http://localhost:3000/health](http://localhost:3000/health).

3. No aparecen archivos en Cypress
   Verifica que estas en Clase8-SOLID/Pruebas-end-to-end y existe cypress/e2e/*.cy.js.

4. No encuentra un selector
   Verifica data-cy en frontend/src/App.tsx.

5. Error de Electron: bad IPC message, reason 114
   Que decir en clase:
   Este fallo es del navegador Electron y no del test. Cambiamos a Chrome para seguir.
   Comando inmediato:
   npm run cy:open:chrome
   Plan B:
   npm run cy:open:edge

6. Necesito demostrar que todo pasa aunque falle la UI de Cypress
   Comando:
   npm run test:e2e
   Explicacion:
   Ejecuta los specs completos en modo run usando Chrome y confirma resultado 100%.

## 10. Cierre y preguntas (5 min)

Texto literal de cierre:

Con E2E protegemos flujos reales de negocio. Si frontend o backend cambian y rompen el flujo, Cypress nos avisa antes de llegar a produccion.

Preguntas de evaluacion rapida:

1. Que diferencia hay entre prueba unitaria y E2E?
2. Donde se configura la ruta base de cy.visit?
3. Por que usamos data-cy en lugar de clases CSS?
4. Que caso negativo agregarias a este proyecto?
