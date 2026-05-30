// src/models/AuditLog.ts
// Modelo (capa de dominio) del componente AuditLog.

/**
 * Tipos de cambios registrados en la bitácora
 * RF-1-7-4: Especificar tipo de cambio
 */
export enum ChangeType {
  CARGADO = 'Cargado',
  MODIFICADO = 'Modificado',
  ELIMINADO = 'Eliminado',
  APROBADO = 'Aprobado',
  RECHAZADO = 'Rechazado',
  RETIRADO = 'Retirado'
}

/**
 * Modelo para registros de auditoría
 * CU1-7: Registrar Cambio
 * Tabla: BITACORA_CAMBIOS
 */
export class AuditLog {
  id?: number;
  activoId: number;
  usuarioId: number;
  tipoCambio: ChangeType;
  estadoAnterior?: string;
  estadoNuevo?: string;
  comentarios?: string;
  fecha: Date;

  constructor(
    activoId: number,
    usuarioId: number,
    tipoCambio: ChangeType,
    estadoNuevo?: string,
    estadoAnterior?: string,
    comentarios?: string
  ) {
    this.activoId = activoId;
    this.usuarioId = usuarioId;
    this.tipoCambio = tipoCambio;
    this.estadoAnterior = estadoAnterior;
    this.estadoNuevo = estadoNuevo;
    this.comentarios = comentarios;
    this.fecha = new Date();
  }
}
