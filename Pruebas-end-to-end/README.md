# Pruebas End-to-End con Cypress - Proyecto Independiente

## Tabla de Contenidos
1. [¿Qué es Cypress?](#qué-es-cypress)
2. [¿Qué es una Prueba End-to-End (E2E)?](#qué-es-una-prueba-end-to-end-e2e)
3. [Prerequisitos](#prerequisitos)
4. [Instalación de Cypress](#instalación-de-cypress)
5. [Estructura del Proyecto](#estructura-del-proyecto)
6. [Archivos de Configuración](#archivos-de-configuración)
7. [Comandos Disponibles](#comandos-disponibles)
8. [Las 5 Pruebas Explicadas](#las-5-pruebas-explicadas)
9. [Cambios en el Frontend](#cambios-en-el-frontend)
10. [Cómo Interpretar Resultados](#cómo-interpretar-resultados)
11. [Troubleshooting](#troubleshooting)

---

## ¿Qué es Cypress?

Cypress es un **framework de pruebas automatizadas moderno** que te permite simular un usuario real interactuando con tu aplicación web. A diferencia de otras herramientas, Cypress:

- **Abre un navegador real** (Chrome, Edge, Firefox) y automatiza acciones como clics, escritura de texto y navegación
- **Se ejecuta en tiempo real**: Ves exactamente cómo se comporta tu app mientras se prueba
- **Es muy estable**: Maneja automáticamente esperas, reintentos y síncronización
- **Facilita depuración**: Puedes pausar, retroceder, inspeccionar elementos y ver el estado de variables en cada paso

**Importantes aclaraciones:**
- Cypress **usa Node.js** para ejecutarse, pero **NO es exclusivo de Node**
- Lo que prueba es la **aplicación web en el navegador**, independientemente de que esté hecha con React, Vue, Angular, etc.
- El código de las pruebas se escriben en **JavaScript**, pero es para testear cualquier app web moderna

### Comparación con otros tipos de pruebas:
- **Unitarias**: Prueban funciones aisladas (`createOrder()` por sí sola)
- **Integración**: Prueban módulos que trabajan juntos (OrderService + ProductService)
- **E2E**: Prueban el flujo completo que un usuario hace: crear producto → crear orden → ver resultado

---

## ¿Qué es una Prueba End-to-End (E2E)?

**End-to-End significa probar un flujo completo de negocio desde el inicio hasta el final, exactamente como lo haría un usuario real.**

### Ejemplo en Clase8-SOLID:
```
Un flujo E2E sería:
1. Abrir la app en el navegador
2. Cambiar a la pestaña "Productos"
3. Llenar el formulario de crear producto (nombre, precio, stock)
4. Hacer clic en "Crear producto"
5. Validar que el producto aparece en la tabla
6. Cambiar a la pestaña "Órdenes"
7. Llenar el formulario de crear orden (email, producto, cantidad)
8. Hacer clic en "Crear orden"
9. Validar que la orden aparece en la tabla
10. Verificar que el stock se actualizó correctamente
```

### Ventaja de E2E vs Unitarias:
- **Test unitario**: "La función `calculateTotal()` devuelve 100 cuando le paso 50 y 50"
  - ✅ Sin UI, sin red, sin base de datos
  - ❌ No sabe si la UI envía bien los datos al backend
  - ❌ No sabe si el backend te devuelve el formato correcto

- **Test E2E**: "El usuario crea un producto, lo ordena, y aparece en la tabla con el precio correcto"
  - ✅ Prueba TODO el flujo: UI → API → Base de datos → UI actualizada
  - ✅ Atrapa errores reales que los tests unitarios pierden
  - ❌ Más lento y complejo de escribir

---

## Prerequisitos

Antes de empezar necesitas:

### 1. Node.js 18+ instalado
```bash
node --version  # Debe ser v18.0.0 o superior
```

### 2. Proyecto Clase8-SOLID corriendo
- Backend en `http://localhost:3000`
- Frontend en `http://localhost:5173`

```bash
# Terminal 1: Backend
cd Clase8-SOLID/backend
npm install
npx prisma db push
npm run dev

# Terminal 2: Frontend
cd Clase8-SOLID/frontend
npm install
npm run dev

# Verifica que ves:
# Backend: "Server running on port 3000"
# Frontend: "Local: http://localhost:5173/"
```

### 3. Este proyecto de pruebas en pasta separada
La carpeta `Pruebas-end-to-end` debe estar **fuera** de Clase8-SOLID, al mismo nivel de `Ejemplos-SOLID`, `Pruebas-Unitarias`, etc.

---

## Instalación de Cypress

### Paso 1: Instalar dependencias

```bash
cd Pruebas-end-to-end
npm install
```

**¿Qué pasa aquí?**
- Descarga `cypress@13.17.0` (definido en `package.json`)
- Crea carpeta `node_modules/` con todas las dependencias
- Tamaño: ~400 MB (es normal, Cypress incluye navegadores)

**¿Qué se genera tras `npm install cypress --save-dev`?**

Al ejecutar `npm install cypress --save-dev`:
1. **Se descarga Cypress**: ~200 MB del archivo ejecutable
2. **Se crean carpetas:**
   - `node_modules/cypress/` - El framework
   - `node_modules/.bin/cypress` - Ejecutable global
3. **Se genera `package-lock.json`**: Bloquea versiones exactas
4. **Se actualiza `package.json`**: Agrega `"cypress": "^13.17.0"` en `devDependencies`

Los archivos generados DESPUÉS de instalar:
```
node_modules/
├── cypress/              # Framework completo
├── .bin/cypress          # Ejecutable
├── sharp/                # Procesador de imágenes
├── electron/             # Motor de Electron
└── ... (700+ paquetes más)

package-lock.json        # Lockfile con versiones exactas
```

---

### Paso 2: Abrir Cypress con interfaz visual

La forma clásica es usar Launchpad (la interfaz gráfica):

```bash
# Opción 1: Abre Cypress con navegador automático (Electron)
npm run cy:open

# Opción 2: Fuerza uso de Chrome (recomendado si Electron falla)
npm run cy:open:chrome

# Opción 3: Usa Edge en lugar de Chrome
npm run cy:open:edge
```

**¿Qué significa `--browser chrome`?**
- `cypress open` por defecto usa Electron (que es inestable en algunos sistemas)
- `cypress open --browser chrome` le dice a Cypress: "Usa Chrome en lugar de Electron"
- También disponible: `--browser edge`, `--browser firefox`

**Sintaxis para abrir con navegador específico:**
```bash
# Sintaxis general:
npx cypress open --browser [navegador]

# Ejemplos:
npx cypress open --browser chrome    # Chrome
npx cypress open --browser edge      # Edge
npx cypress open --browser firefox   # Firefox
npx cypress open --browser electron  # Electron (por defecto)
```

---

### Paso 3: En el Launchpad que se abre

1. Haz clic en **"E2E Testing"**
2. Selecciona un navegador (Chrome recomendado)
3. Ves la lista de specs (archivos `.cy.js`)
4. Haz clic en cualquiera para ejecutarlo
5. El navegador se abre y ves cómo Cypress automatiza las acciones

**¿Qué es Launchpad?**
Es la interfaz gráfica de Cypress. Aquí puedes:
- Ver todos los tests (specs) disponibles
- Ejecutar uno o todos
- Ver timestamps de cuándo se ejecutaron
- Pausar/retroceder durante la ejecución

---

## Estructura del Proyecto

```
Pruebas-end-to-end/
├── cypress.config.js              # Configuración global de Cypress
├── package.json                   # Scripts y dependencias
├── README.md                       # Este archivo
├── cypress/
│   ├── e2e/                       # Archivos de prueba (tests)
│   │   ├── 01-primera-prueba.cy.js
│   │   ├── 02-productos.cy.js
│   │   ├── 03-ordenes.cy.js
│   │   ├── 04-validaciones.cy.js
│   │   └── 05-comandos-basicos-demo.cy.js
│   └── support/
│       ├── e2e.js                 # Se ejecuta antes de cada prueba
│       └── commands.js            # Comandos personalizados
└── node_modules/                  # Librerías descargadas
```

**Nota:** La carpeta `cypress/` se genera automáticamente la primera vez que abres Cypress.

---

## Archivos de Configuración

### 1. `cypress.config.js` - Las Reglas del Juego

Este archivo configura **cómo se comporta Cypress**. Veamos con comentarios:

```javascript
// Este archivo es como las reglas del juego para Cypress
const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    // URL base para todas las pruebas
    // Cuando escribes cy.visit("/"), Cypress va a:
    // http://localhost:5173/
    baseUrl: "http://localhost:5173",

    // Dónde buscar archivos de prueba
    // Cypress automáticamente encuentra todos los .cy.js en cypress/e2e/
    specPattern: "cypress/e2e/**/*.cy.js",

    // Archivo que se ejecuta ANTES de cada prueba
    // Aquí importamos comandos personalizados y hooks globales
    supportFile: "cypress/support/e2e.js",

    // Video de grabación de tests
    video: false,        // No grabar video (ahorra espacio)

    // Tomar screenshot si un test falla
    screenshotOnRunFailure: true,

    // Tiempo máximo de espera (en milisegundos)
    // Si un elemento no aparece en 8 segundos, Cypress falla
    defaultCommandTimeout: 8000,

    // Resolución de pantalla simulada
    viewportWidth: 1366,
    viewportHeight: 768,

    // Reintentos automáticos
    retries: {
      runMode: 1,   // CI/CD: reintentar 1 vez si falla
      openMode: 0,  // Modo interactivo: no reintentar
    },
  },
});
```

**¿Por qué importa cada configuración?**
- `baseUrl`: Conecta tus tests con tu app
- `specPattern`: Le dice a Cypress dónde buscar tests
- `defaultCommandTimeout`: Evita que tests fallen prematuramente
- `retries`: Hace tests más resilientes en CI/CD

---

### 2. `cypress/support/e2e.js` - Preparación Global

```javascript
// Este archivo se ejecuta ANTES de cada prueba
// Es como una "clase de preparación" antes de cada test

// Importa comandos personalizados de commands.js
import "./commands";

// Aquí podrías agregar más código que se ejecute globalmente
// Ejemplo: cookies, setup inicial, etc.
```

**¿Por qué existe?**
- Carga automáticamente comandos personalizados en todos los tests
- Es un lugar para código global reutilizable

---

### 3. `cypress/support/commands.js` - Comandos Personalizados

Este archivo crea **comandos reutilizables** para hacer los tests más legibles. Veamos comentado:

```javascript
// ============================================================
// Aquí se definen comandos personalizados para Cypress
// Un comando personalizado es un atajo para código repetitivo
// ============================================================

// Agrega un nuevo comando llamado "getByDataCy"
// Lo usarás en todos tus tests
Cypress.Commands.add("getByDataCy", (value) => {
  // Este comando busca elementos usando el atributo data-cy
  
  // SIN este comando, deberías escribir cada vez:
  // cy.get('[data-cy="product-name"]')
  // cy.get('[data-cy="create-product"]')
  // cy.get('[data-cy="order-email"]')
  
  // CON este comando, escribes simplemente:
  // cy.getByDataCy("product-name")
  // cy.getByDataCy("create-product")
  // cy.getByDataCy("order-email")

  return cy.get(`[data-cy="${value}"]`);
});

// ============================================================
// ¿Por qué esto es importante?
// ============================================================

// 1. MÁS LEGIBLE: 
//    cy.getByDataCy("product-name")
//    es más claro que:
//    cy.get('[data-cy="product-name"]')

// 2. MÁS ESPECÍFICO:
//    Solo busca en el atributo data-cy
//    No confunde con clases CSS que podrían cambiar

// 3. REUTILIZABLE:
//    Usas el mismo comando en todos los tests
//    Si cambias la estrategia, cambias en UN SOLO lugar

// ============================================================
// ¿Qué es data-cy?
// ============================================================

// Es un atributo HTML que agregamos SOLO para pruebas:
// <input data-cy="product-name" placeholder="Nombre" />
//
// Características:
// - No afecta la app en producción
// - Es invisible para los usuarios
// - Es estable: no cambia si modificas CSS o texto
//
// Analogía: Es como le pones stickers a los elementos
//           para que Cypress los encuentre fácilmente
```

---

## Comandos Disponibles

### Ejecutar TODOS los tests de una vez

```bash
# Opción 1: Modo headless (sin interface, rápido, para CI/CD)
npm run test:e2e

# Opción 2: Con navegador visible (más lento, para depuración)
npm run cy:headed

# Opción 3: En Edge en lugar de Chrome
npm run test:e2e:edge
```

**¿Qué significa "headless"?**
- El navegador se ejecuta sin interface visual
- 2-3x más rápido que con interfaz
- Perfecto para integración continua (GitHub Actions, etc.)

---

### Ejecutar un test específico (para demos en clase)

```bash
npm run demo:01    # Test 1: Carga de app
npm run demo:02    # Test 2: Crear producto
npm run demo:03    # Test 3: Flujo E2E
npm run demo:04    # Test 4: Validaciones
npm run demo:05    # Test 5: Demo de comandos
```

Cada comando abre el navegador, corre ese test, y lo cierra. **Perfecto para proyectar en clase.**

---

### Interfaz visual interactiva

```bash
npm run cy:open            # Abre Launchpad (Electron)
npm run cy:open:chrome     # Abre Launchpad con Chrome
npm run cy:open:edge       # Abre Launchpad con Edge
```

---

## Las 5 Pruebas Explicadas

Todos los tests están en [cypress/e2e/](cypress/e2e/). Están numerados del 01 al 05 porque cada uno enseña algo nuevo y más complejo.

### Test 01: Smoke Test - Verificar que la app carga

**Archivo:** [cypress/e2e/01-primera-prueba.cy.js](cypress/e2e/01-primera-prueba.cy.js)

**Objetivo:** Verificar que la app carga sin errores.

**¿Qué hace?**
1. Abre la app (`cy.visit("/")`)
2. Valida que el título "SOLID Orders" está visible
3. Valida que existen los botones de navegación

**Código comentado:**
```javascript
// ============================================================
// Objetivo: smoke test para verificar que la app carga.
// Comandos clave: visit, contains, getByDataCy.
// Nota: cy.visit("/") usa baseUrl definido en cypress.config.js
// ============================================================
describe("01 - Mi primera prueba en Cypress", () => {
  it("Visita la pagina principal y valida elementos base", () => {
    
    // cy.visit(): abre la URL indicada en el navegador que Cypress controla.
    // Como baseUrl="http://localhost:5173", esto navega a esa URL.
    cy.visit("/");

    // cy.contains(): busca un texto visible en pantalla.
    // En este caso, busca donde sea que esté el texto "SOLID Orders"
    cy.contains("SOLID Orders").should("be.visible");

    // cy.getByDataCy(): nuestro comando personalizado para buscar por data-cy
    // Busca elementos con data-cy="tab-orders" en el HTML
    cy.getByDataCy("tab-orders").should("be.visible");
    
    // Valida que el botón de productos también es visible
    cy.getByDataCy("tab-products").should("be.visible");
  });
});
```

**Resultado esperado en Cypress:**
```
✅ Passed: 1
   Duración: 804ms
   
   Validaciones que pasaron:
   - "SOLID Orders" title is visible
   - "Orders" button is visible
   - "Products" button is visible
   
   Network requests:
   GET 200 /api/products
   GET 200 /api/orders
```

**¿Cómo interpretar los números en el Test Body?**
```
1  visit/                                # Navega a /
2  containsSOLID Orders                 # Busca el texto
3  assertexpected <span> to be visible  # Valida que sea visible
4  get[data-cy="tab-orders"]            # Selecciona elemento
5  assertexpected <button> to be visible # Valida que sea visible
6  get[data-cy="tab-products"]          # Selecciona elemento
7  assertexpected <button> to be visible # Valida que sea visible
(fetch)GET 200 /api/products            # Request exitoso
(fetch)GET 200 /api/orders              # Otro request exitoso
```

Los números son las **acciones que Cypress ejecutó en orden**. Si algo falla, ves exactamente en qué paso.

---

### Test 02: CRUD - Crear Producto

**Archivo:** [cypress/e2e/02-productos.cy.js](cypress/e2e/02-productos.cy.js)

**Objetivo:** Crear un producto desde la interfaz y validarlo en la tabla.

**¿Qué valida?**
- El usuario puede navegar a la pestaña de productos
- El usuario puede llenar un formulario
- El producto se crea en el backend
- El producto aparece en la tabla

**Código comentado:**
```javascript
// ============================================================
// Objetivo: crear un producto desde la UI y validarlo en tabla.
// Comandos clave: click, type, getByDataCy, contains.
// ============================================================
describe("02 - Gestion de productos", () => {
  it("Crea un producto desde la UI", () => {
    
    // Genera un nombre único usando timestamp
    // Ejemplo de salida: "Producto Cypress 1776114073491"
    // Así, cada vez que corres el test, el nombre es distinto
    const productName = `Producto Cypress ${Date.now()}`;

    cy.visit("/");

    // cy.click(): hace clic en un elemento, como lo haría una persona
    cy.getByDataCy("tab-products").click();

    // cy.type(): escribe texto en inputs o textareas
    // Aquí escribe el nombre del producto
    cy.getByDataCy("product-name").type(productName);
    
    // Escribe el precio
    cy.getByDataCy("product-price").type("150");
    
    // Escribe el stock disponible
    cy.getByDataCy("product-stock").type("7");

    // Hace clic en el botón para crear producto
    cy.getByDataCy("create-product").click();

    // Validamos que el nuevo producto aparezca en la tabla
    // contains() busca el nombre que escribimos
    cy.getByDataCy("products-table").contains(productName).should("be.visible");
  });
});
```

**Resultado esperado:**
```
✅ Passed: 1
   Duración: 2.4s
   
   Pasos ejecutados (Test Body):
   1. visit/                                 # Navega
   2. get[data-cy="tab-products"]            # Selecciona tab
   3. click                                  # Hace clic
   (fetch)GET 200 /api/products              # Fetch datos
   4. get[data-cy="product-name"]            # Selecciona input
   5. typeProducto Cypress 1776114073491     # Escribe nombre
   6. get[data-cy="product-price"]           # Selecciona input
   7. type150                                # Escribe precio
   (fetch)GET 200 /api/products              # Fetch actualizado
   8. get[data-cy="product-stock"]           # Selecciona input
   9. type7                                  # Escribe stock
   10. get[data-cy="create-product"]         # Selecciona botón
   11. click                                 # Hace clic
   (fetch)POST 201 /api/products             # Backend crea producto
   12. get[data-cy="products-table"]         # Selecciona tabla
   13. containsProducto Cypress 1776114073491 # Busca el texto
   14. assertexpected <td> to be visible     # Valida visibilidad
   (fetch)GET 200 /api/products              # Fetch actualizado
```

**¿Por qué `Date.now()`?**
- Genera un timestamp único cada vez: `1776114073491`
- Si corres el test 2 veces, crea 2 productos diferentes
- Sin esto, el segundo test falla porque el producto ya existe

---

### Test 03: End-to-End - Flujo Completo (Lo Más Importante)

**Archivo:** [cypress/e2e/03-ordenes.cy.js](cypress/e2e/03-ordenes.cy.js)

**Objetivo:** El usuario crea un producto y luego lo ordena.

**¿Por qué es E2E?**
- No es solo "crear producto"
- No es solo "crear orden"
- **ES AMBAS COSAS JUNTAS**: un flujo real de negocio

**Código comentado:**
```javascript
// ============================================================
// Objetivo: flujo real de negocio, crear producto y luego orden.
// Comandos clave: visit, type, click, select, contains.
// Este es el TEST MÁS IMPORTANTE porque prueba un flujo completo
// ============================================================
describe("03 - Flujo real: crear orden", () => {
  it("El usuario crea producto y luego registra una orden", () => {
    
    // Nombre único para el producto
    const productName = `Kit E2E ${Date.now()}`;
    
    // Email del cliente que será usado en la orden
    const customerEmail = "estudiante.e2e@correo.com";

    cy.visit("/");

    // ======== PASO 1: Crear un producto ========
    cy.getByDataCy("tab-products").click();
    cy.getByDataCy("product-name").type(productName);
    cy.getByDataCy("product-price").type("50");
    cy.getByDataCy("product-stock").type("3");
    cy.getByDataCy("create-product").click();
    
    // Validar que el producto fue creado y aparece en tabla
    cy.getByDataCy("products-table").contains(productName).should("be.visible");

    // ======== PASO 2: Ir a órdenes y completar formulario ========
    cy.getByDataCy("tab-orders").click();
    cy.getByDataCy("order-email").type(customerEmail);
    cy.getByDataCy("order-qty").clear().type("2");

    // ======== PASO 3: Buscar y seleccionar el producto creado ========
    // El dropdown tiene opciones dinámicas que varía cada ejecución
    // No podemos usar .select("Kit E2E 1776115018785") porque el ID cambia
    
    // En cambio:
    // 1. Buscamos todos los options del select
    // 2. Filtramos por el que contiene nuestro productName
    // 3. Obtenemos su value (el ID numérico)
    // 4. Seleccionamos por ID
    
    cy.getByDataCy("order-product")
      .find("option")                    // Busca todos los <option>
      .contains(productName)             // Filtra por texto
      .then(($option) => {
        const optionValue = $option.val();  // Obtiene el value
        cy.getByDataCy("order-product").select(String(optionValue));
      });

    cy.getByDataCy("create-order").click();

    // ======== PASO 4: Validar que la orden fue creada ========
    // La orden debe aparecer en la tabla con el correo ingresado
    cy.getByDataCy("orders-table").contains(customerEmail).should("be.visible");
  });
});
```

**Resultado esperado:**
```
✅ Passed: 1
   Duración: 3.2s
   
   Validaciones:
   - Producto "Kit E2E 1776115018785" creado en backend
   (fetch)POST 201 /api/products
   - Orden creada con email "estudiante.e2e@correo.com"
   (fetch)POST 201 /api/orders
   - Orden visible en tabla con email del cliente
```

**¿Por qué usamos `.then()` para seleccionar el producto?**
```javascript
// El dropdown tiene opciones dinámicas como:
// <select data-cy="order-product">
//   <option value="">— seleccionar —</option>
//   <option value="1">Laptop - $500 (10 en stock)</option>
//   <option value="2">Kit E2E 1776115018785 - $50 (3 en stock)</option>
// </select>

// El problema es que el nombre y el ID cambian cada vez que corres el test
// Por eso no podemos hacer: .select("Kit E2E 1776115018785")

// La solución es:
// 1. find("option") - obtén todos los elementos <option>
// 2. contains(productName) - filtra el que tenga nuestro nombre
// 3. .then($option => {...}) - espera a que Cypress lo encuentre
// 4. $option.val() - obtén el value del option (el ID numérico)
// 5. select(String(optionValue)) - selecciona usando el ID
```

---

### Test 04: Validaciones - Casos Negativos

**Archivo:** [cypress/e2e/04-validaciones.cy.js](cypress/e2e/04-validaciones.cy.js)

**Objetivo:** Verificar que la app rechaza datos inválidos.

**¿Qué valida?**
- No se permite crear orden sin datos
- No se permite ordenar más stock del disponible

**Código comentado:**
```javascript
// ============================================================
// Objetivo: probar casos negativos de validacion y reglas de negocio
// Comandos clave: visit, click, type, select, assertions de error.
// ============================================================
describe("04 - Validaciones y errores", () => {
  
  // ========== TEST 4.1: Orden sin datos ==========
  it("Muestra error si se intenta crear orden sin datos", () => {
    cy.visit("/");

    cy.getByDataCy("tab-orders").click();
    
    // Intenta crear orden SIN llenar NINGÚN campo
    cy.getByDataCy("create-order").click();

    // Debe mostrar un mensaje de error
    cy.getByDataCy("error-message")
      .should("be.visible")  // El div de error es visible
      .and("contain", "Completa todos los campos");  // Contiene este texto
  });

  // ========== TEST 4.2: Stock insuficiente ==========
  it("Muestra error de stock insuficiente", () => {
    const productName = `Stock Bajo ${Date.now()}`;

    cy.visit("/");

    // Paso 1: Crea producto con solo 1 unidad de stock
    cy.getByDataCy("tab-products").click();
    cy.getByDataCy("product-name").type(productName);
    cy.getByDataCy("product-price").type("99");
    cy.getByDataCy("product-stock").type("1");  // ← Solo 1 unidad disponible
    cy.getByDataCy("create-product").click();

    // Paso 2: Intenta ordenar 2 unidades del mismo producto
    cy.getByDataCy("tab-orders").click();
    cy.getByDataCy("order-email").type("stock@test.com");
    cy.getByDataCy("order-qty").clear().type("2");  // ← Pide 2, hay solo 1

    // Busca y selecciona el producto creado
    cy.getByDataCy("order-product")
      .find("option")
      .contains(productName)
      .then(($option) => {
        const optionValue = $option.val();
        cy.getByDataCy("order-product").select(String(optionValue));
      });

    cy.getByDataCy("create-order").click();

    // Paso 3: Valida que backend rechaza la orden y muestra error
    cy.getByDataCy("error-message")
      .should("be.visible")
      .and("contain", "Stock insuficiente");
  });
});
```

**Resultados esperados:**
```
✅ Passed: 2
   Duración: 3.1s total
   
   TEST 4.1:
   - (fetch)POST 400 /api/orders  [Error: 400 Bad Request]
   - "error-message" div is visible
   - Contains: "Completa todos los campos"
   
   TEST 4.2:
   - Producto creado: "Stock Bajo 1776116576978"
   - (fetch)POST 400 /api/orders  [Error: 400 Bad Request]
   - "error-message" div is visible
   - Contains: "Stock insuficiente"
```

---

### Test 05: Demo de Comandos Básicos

**Archivo:** [cypress/e2e/05-comandos-basicos-demo.cy.js](cypress/e2e/05-comandos-basicos-demo.cy.js)

**Objetivo:** En UN SOLO test, demostrar todos los comandos básicos de Cypress.

**¿Por qué existe?**
Es como el "Hello World" de Cypress. Cuando alguien nuevo abre tu codebase, este test muestra todo en una página.

---

## Cómo Interpretar Resultados

### 1. La Pantalla Principal de Cypress (Launchpad)

Cuando abres Cypress, ves esta interfaz:

```
┌─────────────────────────────────────────┐
│  Specs        Runs        Debug          │
│                                         │
│  5 matches                              │
│                                         │
│  □ 01-primera-prueba.cy.js    4h ago   │
│  □ 02-productos.cy.js         4h ago   │
│  □ 03-ordenes.cy.js           4h ago   │
│  □ 04-validaciones.cy.js      4h ago   │
│  □ 05-comandos-basicos-demo   4h ago   │
└─────────────────────────────────────────┘
```

**¿Qué significa cada columna?**
- **Archivo**: Nombre del test
- **Last updated**: Cuándo se ejecutó por última vez
- **Average duration**: Tiempo promedio que tarda
- Los guiones `--` significa que no se ha ejecutado

---

### 2. Resultados Después de Ejecutar un Test

**Ejemplo de Test EXITOSO:**

```
Cypress
SpecRunner
Passed: 1
Failed: --
Pending: --

01-primera-prueba.cy.js  804ms
  ✅ 01 - Mi primera prueba en Cypress
     Visita la pagina principal y valida elementos base  [passed]

Test body (pasos ejecutados):
1  visit/
2  containsSOLID Orders
3  assertexpected <span> to be visible
4  get[data-cy="tab-orders"]
5  assertexpected <button> to be visible
6  get[data-cy="tab-products"]
7  assertexpected <button> to be visible

Network requests (fetch):
GET 200 /api/products
GET 200 /api/orders
GET 200 /api/orders
GET 200 /api/products
```

**Interpretación:**
- `✅ Passed: 1` - 1 test pasó exitosamente
- `804ms` - Tardó 804 milisegundos
- Números 1-7 son los **pasos ejecutados en orden**
- `assert expected <span> to be visible` - Validó que un elemento sea visible
- `GET 200` - Requests HTTP exitosas (200 = OK)

---

**Ejemplo de Test FALLIDO:**

```
Cypress
SpecRunner
Passed: 0
Failed: 1
Pending: --

02-productos.cy.js  2100ms  ❌
  ❌ 02 - Gestion de productos
     Crea un producto desde la UI  [FAILED]

Error: 
Timed out retrying after 8000ms: expected element not found
Looking for: [data-cy="product-name"]

Test body:
1  visit/
2  get[data-cy="tab-products"]
3  click
...
X  get[data-cy="product-name"]  ← FALLO AQUÍ
```

**Interpretación:**
- `❌ Failed: 1` - Un test falló
- `Timed out retrying after 8000ms` - Cypress esperó 8 segundos pero no encontró el elemento
- `Looking for: [data-cy="product-name"]` - Buscaba este elemento
- El test se detiene en el paso donde falla

---

### 3. ¿Qué ver cuando haces clic en los pasos?

**Cuando ejecutas un test, ves una lista de pasos. Si pasas el cursor sobre uno:**

```
1  visit/                    ← Pasa el cursor aquí
   Network: GET /api/products 200
   
   En el navegador (a la derecha):
   - URL cambia a http://localhost:5173/
   - La app se carga
   - Ves el titulo SOLID Orders
```

```
4  get[data-cy="tab-orders"]  ← Pasa el cursor aquí
   En el navegador:
   - El elemento se DESTACA con un rectángulo azul
   - Ves exactamente qué elemento buscaba Cypress
   - Si es rojo, significa que no lo encontró
```

```
5  type Producto Cypress 1776114073491  ← Pasa el cursor aquí
   En el navegador:
   - Ves el input que recibió el texto
   - El texto escrito aparece en el campo
```

**¿Por qué es útil?**
- Si un test falla, haces clic en cada paso para ver dónde se rompió
- Ves exactamente qué elemento Cypress trataba de encontrar
- Si el elemento tiene un rectángulo azul, lo encontró
- Si no tiene rectángulo, Cypress no lo pudo encontrar

---

### 4. Navegador DevTools en Cypress

El navegador que abre Cypress tiene DevTools disponibles (F12):

```
Pasos en Cypress                    Navegador con DevTools
┌──────────────────────┐           ┌──────────────────────┐
│ 1 visit/             │           │ SOLID Orders App     │
│ 2 getByDataCy()      │           │ [F12 para DevTools]  │
│ 3 click              │  ────→    │ Elements | Console   │
│ 4 type(...)          │           │ Network | Sources    │
│ [cursor aquí]        │           │                      │
│                      │           │ [Rectángulo azul     │
│                      │           │  alrededor del elem] │
└──────────────────────┘           └──────────────────────┘
```

Puedes inspeccionar elementos, ver requests, ver errores de consola, etc.

---

## Cambios en el Frontend

Para que Cypress pueda identificar elementos de forma estable agregamos atributos `data-cy` en el código React.

### ¿Por qué se necesita esto?

**Problema sin `data-cy`:**
```javascript
// Si buscas por clase CSS
cy.get(".btn-primary").click()
// ¿Qué pasa si cambias el CSS a "btn-success"? ¡El test se rompe!

// Si buscas por texto
cy.contains("Create").click()
// ¿Qué pasa si cambias el texto a "Crear"? ¡El test se rompe!
```

**Solución con `data-cy`:**
```javascript
cy.getByDataCy("create-product").click()
// El atributo data-cy no está vinculado a CSS ni a texto
// Solo cambia si un desarrollador lo decide conscientemente
```

---

### Qué se agregó en `frontend/src/App.tsx`

**Antes (sin Cypress):**
```jsx
<button onClick={createProduct}>Agregar producto</button>
```

**Después (con Cypress):**
```jsx
<button data-cy="create-product" onClick={createProduct}>Agregar producto</button>
```

---

### Todos los atributos `data-cy` agregados

En [Clase8-SOLID/frontend/src/App.tsx](../Clase8-SOLID/frontend/src/App.tsx):

| Elemento | Selector Agregado | Usado en Tests |
|----------|-------------------|----------------|
| Botón Órdenes | `data-cy="tab-orders"` | 01, 03, 04, 05 |
| Botón Productos | `data-cy="tab-products"` | 01, 02, 03, 04 |
| Input Nombre Producto | `data-cy="product-name"` | 02, 03, 04 |
| Input Precio | `data-cy="product-price"` | 02, 03, 04 |
| Input Stock | `data-cy="product-stock"` | 02, 03, 04 |
| Botón Crear Producto | `data-cy="create-product"` | 02, 03, 04 |
| Input Email Orden | `data-cy="order-email"` | 03, 04, 05 |
| Select Producto Orden | `data-cy="order-product"` | 03, 04, 05 |
| Input Cantidad | `data-cy="order-qty"` | 03, 04, 05 |
| Botón Crear Orden | `data-cy="create-order"` | 03, 04, 05 |
| Tabla Productos | `data-cy="products-table"` | 02, 03 |
| Tabla Órdenes | `data-cy="orders-table"` | 03, 04, 05 |
| Div Error | `data-cy="error-message"` | 04 |
| Botón Cerrar Error | `data-cy="close-error"` | 04 |
| Botón Refrescar | `data-cy="refresh-data"` | Opcional |

---

### Ejemplo específico de cambio

**En el archivo `Clase8-SOLID/frontend/src/App.tsx`:**

```jsx
// Antes (línea ~150):
<input style={S.inp} placeholder="Email del cliente" 
  value={oEmail} onChange={e => setOEmail(e.target.value)} />

// Después:
<input data-cy="order-email" style={S.inp} placeholder="Email del cliente" 
  value={oEmail} onChange={e => setOEmail(e.target.value)} />
```

```jsx
// Antes (línea ~165):
<table style={{ width: "100%", borderCollapse: "collapse" }}>

// Después:
<table data-cy="orders-table" style={{ width: "100%", borderCollapse: "collapse" }}>
```

**¿Vimos esto en la app?**
- NO: `data-cy` no es visible al usuario (es un atributo HTML invisible)
- SÍ: Cypress lo ve y puede usarlo para encontrar elementos

---

### ¿Por qué NO se modificó el Backend?

El backend NO necesita cambios porque:
- Cypress **NO hace requests directamente al backend**
- Cypress simula a un usuario en el navegador
- El usuario (o Cypress) va a través del **frontend**
- El frontend es el que hace las requests HTTP al backend

**Flujo:**
```
Cypress en navegador → UI de React → requests HTTP → Backend
```

Si quisieras testear el backend directamente (tests de API), sí necesitarías cambios, pero eso es diferente a E2E.

---

## Troubleshooting

### Error: `bad IPC message reason 114` en Cypress Open

**Significa:** Electron (el navegador que usa Cypress por defecto) tiene problemas en tu sistema.

**Solución:**
```bash
# Usa Chrome en lugar de Electron
npm run cy:open:chrome

# O Edge
npm run cy:open:edge
```

---

### Error: `Cannot find module 'cypress'`

**Significa:** No ejecutaste `npm install`.

**Solución:**
```bash
cd Pruebas-end-to-end
npm install
```

---

### Test falla con: `Timed out retrying after 8000ms: expected element not found`

**Significa:** Cypress no encontró el elemento en 8 segundos.

**Posibles causas:**
- El frontend no está corriendo
- El atributo `data-cy` tiene un typo
- El elemento está dentro de un dropdown u otro contenedor no visible

**Solución:**
1. Verifica que frontend está en `http://localhost:5173`
2. Verifica que el nombre en `data-cy` es exacto (mayúsculas/minúsculas importan)
3. Abre DevTools (F12) en el navegador de Cypress y busca manualmente el elemento

---

### Frontend cambia pero los tests siguen pasando (oops!)

**Significa:** Los selectores CSS/texto cambiaron pero `data-cy` sigue igual.

**Razón:**
Es por diseño, es una VENTAJA. Los `data-cy` no se rompen con cambios de CSS.

**Cuándo SÍ se rompe un test:**
- Cambias el atributo `data-cy` en el Frontend
- Cambias la lógica (ej: antes validaba email, ahora no)
- Cambias el flujo de la app

---

## Próximos Pasos

1. ✅ Entender qué es Cypress y E2E
2. ✅ Instalar Cypress en tu máquina
3. ✅ Ver los 5 tests correr
4. ⏭️ Modificar un test existente
5. ⏭️ Crear tu propio test
6. ⏭️ Integrar con CI/CD (GitHub Actions)

---

## Cómo Correr Todo Desde Cero

### Setup Completo (Primera Vez)

```bash
# 1. Terminal Backend
cd Clase8-SOLID/backend
npm install
npx prisma db push
npm run dev
# Ves: "Server running on port 3000"

# 2. Terminal Frontend (nueva pestaña)
cd Clase8-SOLID/frontend
npm install
npm run dev
# Ves: "Local: http://localhost:5173/"

# 3. Terminal Cypress (pestaña nueva)
cd Pruebas-end-to-end
npm install
npm run cy:open:chrome
# Ves Launchpad de Cypress
```

---

### Ejecutar Todos los Tests

```bash
# En la terminal de Cypress, corre todos:
npm run test:e2e

# Resultado:
# ============ Test Summary =============
# ✅ 01-primera-prueba.cy.js       804ms   [PASSED]
# ✅ 02-productos.cy.js           2.4s    [PASSED]
# ✅ 03-ordenes.cy.js             3.2s    [PASSED]
# ✅ 04-validaciones.cy.js        3.1s    [PASSED]
# ✅ 05-comandos-basicos-demo     2.8s    [PASSED]
# =========== 5 tests passed ===========
```

---

### Ejecutar en Clase (Demos)

```bash
# Uno a uno:
npm run demo:01  # Muestra: carga de app
npm run demo:02  # Muestra: crear producto
npm run demo:03  # Muestra: flujo E2E
npm run demo:04  # Muestra: validaciones
npm run demo:05  # Muestra: todos los comandos
```

Cada comando abre el navegador, corre ese test, y lo cierra. Es perfecto para proyectar en clase.

---

¡Listo para automatizar pruebas con Cypress! 🚀
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
