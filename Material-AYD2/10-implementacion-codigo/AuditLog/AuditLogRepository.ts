// src/repositories/AuditLogRepository.ts
// Repositorio (capa de persistencia) del componente AuditLog.

import { IobtenerBase } from '../config/database';
import { myDb } from '../container/db.container';
import { AuditLog, ChangeType } from '../models/AuditLog';




/**
 * Repositorio para operaciones de auditoría
 * CU1-7: Registrar Cambio
 * RF-1-7-1 a RF-1-7-7
 */
export class AuditLogRepository {
  public constructor(private db: IobtenerBase = myDb) { }
  /**
   * Crea un registro de auditoría
   * RF-1-7-7: Guardar registro completo para auditoría
   */
  async create(auditLog: AuditLog): Promise<number> {
    try {
      const result = await this.db.query<any>(
        `INSERT INTO BITACORA_CAMBIOS 
         (activo_id, usuario_id, tipo_cambio, estado_anterior, estado_nuevo, comentarios, fecha)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          auditLog.activoId,
          auditLog.usuarioId,
          auditLog.tipoCambio,
          auditLog.estadoAnterior || null,
          auditLog.estadoNuevo || null,
          auditLog.comentarios || null,
          auditLog.fecha
        ]
      );

      return result.insertId;
    } catch (error) {
      throw new Error(`Error al crear registro de auditoría: ${(error as Error).message}`);
    }
  }

  /**
   * Obtiene el historial de cambios de un activo
   * RF-1-7-1: Asociar cambios al identificador único del activo
   */
  async findByAssetId(activoId: number): Promise<AuditLog[]> {
    try {
      const rows = await this.db.query<any[]>(
        `SELECT 
          bc.id,
          bc.activo_id as activoId,
          bc.usuario_id as usuarioId,
          bc.tipo_cambio as tipoCambio,
          bc.estado_anterior as estadoAnterior,
          bc.estado_nuevo as estadoNuevo,
          bc.comentarios,
          bc.fecha,
          u.nombre as usuarioNombre
         FROM BITACORA_CAMBIOS bc
         JOIN USUARIOS u ON bc.usuario_id = u.id
         WHERE bc.activo_id = ?
         ORDER BY bc.fecha DESC`,
        [activoId]
      );

      return rows.map(row => {
        const log = new AuditLog(
          row.activoId,
          row.usuarioId,
          row.tipoCambio as ChangeType,
          row.estadoNuevo,
          row.estadoAnterior,
          row.comentarios
        );
        log.id = row.id;
        log.fecha = new Date(row.fecha);
        return log;
      });
    } catch (error) {
      throw new Error(`Error al obtener historial de auditoría: ${(error as Error).message}`);
    }
  }

  /**
   * Obtiene cambios por usuario
   * RF-1-7-2: Dejar constancia del responsable de cada cambio
   */
  async findByUserId(usuarioId: number): Promise<AuditLog[]> {
    try {
      const rows = await this.db.query<any[]>(
        `SELECT * FROM BITACORA_CAMBIOS WHERE usuario_id = ? ORDER BY fecha DESC`,
        [usuarioId]
      );

      return rows.map(row => {
        const log = new AuditLog(
          row.activo_id,
          row.usuario_id,
          row.tipo_cambio as ChangeType,
          row.estado_nuevo,
          row.estado_anterior,
          row.comentarios
        );
        log.id = row.id;
        log.fecha = new Date(row.fecha);
        return log;
      });
    } catch (error) {
      throw new Error(`Error al obtener cambios del usuario: ${(error as Error).message}`);
    }
  }

  /**
   * Obtiene el último cambio de un activo
   */
  async findLastChange(activoId: number): Promise<AuditLog | null> {
    try {
      const rows = await this.db.query<any[]>(
        `SELECT * FROM BITACORA_CAMBIOS 
         WHERE activo_id = ? 
         ORDER BY fecha DESC 
         LIMIT 1`,
        [activoId]
      );

      if (rows.length === 0) return null;

      const row = rows[0];
      const log = new AuditLog(
        row.activo_id,
        row.usuario_id,
        row.tipo_cambio as ChangeType,
        row.estado_nuevo,
        row.estado_anterior,
        row.comentarios
      );
      log.id = row.id;
      log.fecha = new Date(row.fecha);

      return log;
    } catch (error) {
      throw new Error(`Error al obtener último cambio: ${(error as Error).message}`);
    }
  }
}
