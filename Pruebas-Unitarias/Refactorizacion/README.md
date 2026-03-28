# Ejemplo de Refactorizacion (Node.js)

Este ejemplo muestra un codigo que no es testeable y como refactorizarlo para poder escribir pruebas unitarias.

## Objetivo

- Identificar acoplamiento fuerte a dependencias internas.
- Refactorizar con inyeccion de dependencias.
- Agregar una prueba unitaria de ejemplo.

## Archivos

- Antes (no testeable):
  - [Pruebas-Unitarias/Refactorizacion/antes/orderService.js](Pruebas-Unitarias/Refactorizacion/antes/orderService.js)
- Despues (testeable):
  - [Pruebas-Unitarias/Refactorizacion/despues/orderService.js](Pruebas-Unitarias/Refactorizacion/despues/orderService.js)
  - [Pruebas-Unitarias/Refactorizacion/despues/orderService.test.js](Pruebas-Unitarias/Refactorizacion/despues/orderService.test.js)

## Que cambia con el refactor

Antes:
- El servicio crea su propia DB y su propio gateway de pagos.
- No se pueden reemplazar dependencias en pruebas.

Despues:
- Se inyectan dependencias al construir el servicio.
- Las pruebas pueden usar mocks y stubs.

## Comandos sugeridos (Git + VS Code)

```bash
git checkout -b feature/refactor-testable
# editar archivo con ayuda de Copilot Chat (CodeX)
npm test
```

## Prompt sugerido para CodeX

"Refactoriza este servicio para que sea testeable. Extrae las dependencias internas (DB y paymentGateway) a parametros de construccion. Mantiene la misma logica de negocio y no cambies el contrato de la funcion placeOrder. Agrega un ejemplo de prueba unitaria usando Jest con mocks."

## Resultado esperado (prueba)

```text
PASS  Refactorizacion/despues/orderService.test.js

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
```
