# Implementacion en Codigo — Componentes e Interfaces

Este ejemplo muestra como dos componentes (Asset y AuditLog) se conectan por interfaces para cumplir trazabilidad de cambios. El objetivo es explicar el flujo, no dar la solucion completa.

## Arquitectura usada en el ejemplo

El backend trabaja con arquitectura en capas y patron MVC:

- **Controller:** capa de entrada/salida HTTP; valida request y arma la respuesta.
- **Service:** capa de negocio; aplica reglas y coordina repositorios.
- **Repository:** capa de persistencia; encapsula consultas a BD.
- **Model:** representa entidades del dominio y sus datos.

## Por que se escogieron estos componentes

- Asset concentra los cambios de estado sobre activos.
- AuditLog garantiza trazabilidad y cumple los RF de auditoria.
- Juntos muestran interfaces provistas/requeridas y su relacion con RF.

## Estructura de carpetas

```
10-implementacion-codigo/
├── README.md
├── Asset/
│   ├── AssetController.ts
│   ├── AssetService.ts
│   ├── AssetRepository.ts
│   ├── Asset.ts
│   ├── FileValidationService.ts
│   └── README.md
└── AuditLog/
    ├── AuditLogService.ts
    ├── AuditLogRepository.ts
    ├── AuditLog.ts
    └── README.md
```

## Explicacion por archivo

- `Asset/AssetController.ts` -> punto de entrada HTTP.
- `Asset/AssetService.ts` -> logica de negocio; implementa y consume interfaces del dominio de activos.
- `Asset/AssetRepository.ts` -> acceso a BD; usa `IobtenerBase`.
- `Asset/Asset.ts` -> define la entidad `Asset`.
- `Asset/FileValidationService.ts` -> valida formatos y estructura de archivos.
- `AuditLog/AuditLogService.ts` -> implementa `IGuardarRegistroCompleto` e `IasociarCambioAlID`.
- `AuditLog/AuditLogRepository.ts` -> persiste y consulta registros; usa `IobtenerBase`.
- `AuditLog/AuditLog.ts` -> define la entidad `AuditLog`.

## Trazabilidad

| Archivo | Interfaz que implementa/usa | RF relacionado | CU relacionado |
|---|---|---|---|
| Asset/AssetRepository.ts | IobtenerBase (uso) | RF-1-3-5 | CU1-3 Gestionar Borrador |
| Asset/AssetService.ts | IActuailzarAsset, IAccederActivoPendiente, IAccederListaActivosPendientes, IEnviarActivoRevisores, IObtenerActivosPorTipo, IObtenerListadoActivos, IActivosPublicados, IObtenerActivoRuta; consume IGuardarRegistroCompleto, IasociarCambioAlID, ILastLog | RF-1-3-5, RF-1-7-1, RF-1-7-2, RF-1-7-7 | CU1-3, CU1-7 |
| AuditLog/AuditLogService.ts | IGuardarRegistroCompleto, IasociarCambioAlID, ILastLog | RF-1-7-1, RF-1-7-2, RF-1-7-7 | CU1-7 Registrar Cambio |
| AuditLog/AuditLogRepository.ts | IobtenerBase (uso) | RF-1-7-1, RF-1-7-2, RF-1-7-7 | CU1-7 Registrar Cambio |
