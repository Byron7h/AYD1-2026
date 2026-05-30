// src/services/AuditLogService.ts
// Service (MVC): capa de negocio del componente AuditLog.

export interface IGuardarRegistroCompleto {
    create(auditLog: AuditLog): Promise<number>;
}
export interface IasociarCambioAlID {
    findByAssetId(activoId: number): Promise<AuditLog[]>;
}

export interface ILastLog {
    findLastChange(activoId: number): Promise<AuditLog | null>;
}


import { AuditLog } from "../models/AuditLog";
import { AuditLogRepository } from "../repositories/AuditLogRepository";

export class AuditLogService
    implements IGuardarRegistroCompleto, IasociarCambioAlID, ILastLog {

    // Implementa: IGuardarRegistroCompleto, IasociarCambioAlID, ILastLog.
    // Consume: AuditLogRepository (IobtenerBase).

    constructor(
        private readonly auditRepo: AuditLogRepository
    ) { }

    /**
     * Caso de uso: Registrar cambio completo
     */
    async create(auditLog: AuditLog): Promise<number> {
        // aquí podrías:
        // - validar datos
        // - enriquecer información
        // - aplicar reglas
        return this.auditRepo.create(auditLog);
    }

    /**
     * Caso de uso: Asociar cambios a un activo
     */
    async findByAssetId(activoId: number): Promise<AuditLog[]> {
        return this.auditRepo.findByAssetId(activoId);
    }

    async findLastChange(activoId: number): Promise<AuditLog | null> {
        return this.auditRepo.findLastChange(activoId);
    }
}
