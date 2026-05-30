# Componente Assets

Este componente corresponde a la gestion de activos y su ciclo de vida.

## Archivos incluidos

- `AssetController.ts`
- `AssetService.ts`
- `AssetRepository.ts`
- `Asset.ts`
- `FileValidationService.ts`

## Interfaces

**Implementa:**
- `IActuailzarAsset`
- `IAccederActivoPendiente`
- `IAccederListaActivosPendientes`
- `IEnviarActivoRevisores`
- `IObtenerActivosPorTipo`
- `IObtenerListadoActivos`
- `IActivosPublicados`
- `IObtenerActivoRuta`

**Consume:**
- `IGuardarRegistroCompleto`
- `IasociarCambioAlID`
- `ILastLog`
- `IobtenerBase`

## Requerimientos funcionales relacionados

- RF-1-3-5
- RF-1-7-1
- RF-1-7-2
- RF-1-7-7
