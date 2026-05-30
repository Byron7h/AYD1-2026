// src/services/AssetService.ts
// Service (MVC): capa de negocio del componente assets.

import { AssetRepository } from '../repositories/AssetRepository';
import { IGuardarRegistroCompleto, IasociarCambioAlID, ILastLog } from './AuditLogService';
import { FactoryProducer } from './factories/FactoryProducer';
import { FileHandler } from '../utils/fileHandler';
import { FileValidationService } from './FileValidationService';
import { 
  CreateAssetWithMetadataDTO, 
  AssetResponseDTO, 
  ValidationResultDTO,
  DatasetMetadataDTO,
  UpdateAssetDTO,
  DeleteAssetDTO,
  WithdrawAssetDTO,
  AuditLogResponseDTO
} from '../dto/AssetDTO';


//../dtos/AssetDTO
import { Asset } from '../models/Asset';
import { AssetType, AssetWithTags } from '../types/AssetType';
import { AssetState } from '../types/AssetState';
import { AuditLog, ChangeType } from '../models/AuditLog';
import {Paper, Dataset, Code, TechnicalDocument } from '../models/Asset';
import { Confidentiality } from '../types/AssetState';
import { NotificationService } from './NotificationService';
import { Notification } from '../models/Notifcation';

export interface IAccederActivoPendiente {
  getAssetById(id: number): Promise<AssetResponseDTO | null>;
  findByDoi?(doi: string): Promise<AssetResponseDTO | null>;
}
export interface IAccederListaActivosPendientes {
  findByState(estado: AssetState): Promise<AssetResponseDTO[]>;
}

export interface IEnviarActivoRevisores{
  submitForReview(id: number, creadorId: number): Promise<void>;
}

export interface IActuailzarAsset {
  updateAssetState(id: number, nuevoEstado: AssetState): Promise<{ success: boolean }>;
}

export interface IObtenerListadoActivos{
  getAllAssets(): Promise<AssetResponseDTO[]>;
}

export interface IObtenerActivosPorTipo{
  getAssetsByType(tipo: AssetType): Promise<AssetResponseDTO[]>;
}

export interface IActivosPublicados{
  getPublishedAssetsByCreator(creadorId: number, allowedConf: Confidentiality[],
    limit: number): Promise<AssetResponseDTO[]>;
  getPublishedAssetsByTag(etiquetaId: number, allowedConf: Confidentiality[],
    limit: number): Promise<AssetResponseDTO[]>;
  getPublishedAssetsByTagIds(etiquetaIds: number[], allowedConf: Confidentiality[],
    limit: number): Promise<AssetResponseDTO[]>;
}

export interface IObtenerActivoRuta {
  findArchivoRutaById(activoId: number): Promise<string | null>;
}

/**
 * Servicio de lógica de negocio para gestión de activos
 * Implementa CU1-1 (Subir Activo) y CU1-2 (Validar Metadatos)
 */
export class AssetService implements IAccederListaActivosPendientes, IEnviarActivoRevisores, IActuailzarAsset, IObtenerActivosPorTipo, IAccederActivoPendiente, IObtenerListadoActivos, IActivosPublicados, IObtenerActivoRuta {

  // Implementa: IActuailzarAsset, IAccederActivoPendiente, IAccederListaActivosPendientes,
  // IEnviarActivoRevisores, IObtenerActivosPorTipo, IObtenerListadoActivos, IActivosPublicados, IObtenerActivoRuta.
  // Consume: IGuardarRegistroCompleto, IasociarCambioAlID, ILastLog.
  
  constructor(
      private guardarRegistoCompleto: IGuardarRegistroCompleto,
      private asociarCambioAlID: IasociarCambioAlID,
      private lastLog: ILastLog,
      private repository: AssetRepository,
      private notificationService: NotificationService,
    ) {
   
  }

  /**
   * CU1-1: Subir Activo (Borrador)
   * RF-1-1-1 a RF-1-1-7: Proceso completo de carga de activo
   */
  async createAsset(
    data: CreateAssetWithMetadataDTO,
    file: Express.Multer.File,
    dictionaryFile?: Express.Multer.File
  ): Promise<AssetResponseDTO> {
    try {
      // RF-1-1-5: Validar archivo antes de procesar
      const fileValidation = await FileValidationService.validateFile(file, data.tipo);
      if (!fileValidation.valid) {
        throw new Error(`Errores de validación de archivo: ${fileValidation.errors.join(', ')}`);
      }
      //console.log(data);
      // Guardar archivo principal
      const subfolder = this.getSubfolderByType(data.tipo);
      const archivoRuta = await FileHandler.saveFile(file, subfolder);
      data.archivoRuta = archivoRuta;
      //console.log("Etiqueta antes de procesar IDs:", data.etiquetasIds);
      data.etiquetasIds = Array.from(new Set((data.etiquetasIds ?? []).filter(id => Number.isInteger(id) && id > 0)));
      //console.log('Etiquetas IDs procesadas:', data.etiquetasIds);
      // Procesar metadatos específicos según tipo
      await this.processTypeSpecificMetadata(data, file, dictionaryFile);

      // RF-1-1-5: Obtener factory según tipo
      const factory = FactoryProducer.getFactory(data.tipo);

      // Crear instancia del activo
      const asset = factory.createAsset(data);

      // RF-1-1-5: Invocar validación de metadatos
      const validator = factory.getValidator();
      const validationErrors = await validator.validate(asset, file);

      // RF-1-2-7: Si hay errores, retornarlos
      if (validationErrors.length > 0) {
        // Limpiar archivo si la validación falla
        await FileHandler.deleteFile(archivoRuta);
        
        throw new Error(
          `Errores de validación: ${validationErrors.map(e => `${e.campo}: ${e.mensaje}`).join('; ')}`
        );
      }

      // RF-1-1-6: Guardar en estado "Borrador"
      const activoId = await this.repository.create(asset);
      asset.id = activoId;

      // CU1-7: Registrar creación en bitácora
      await this.registerChange(
        activoId,
        data.creadorId,
        ChangeType.CARGADO,
        AssetState.BORRADOR,
        undefined,
        'Activo creado inicialmente como borrador'
      );

      const result = await this.repository.findById(activoId); 
      if (!result) {
          throw new Error("Activo creado pero no se pudo recuperar para respuesta");
      }
      // RF-1-1-7: Retornar confirmación
      return this.mapAssetToResponse(result);
    } catch (error) {
      throw new Error(`Error al crear activo: ${(error as Error).message}`);
    }
  }

  /**
   * Procesa metadatos específicos según el tipo de activo
   */
  private async processTypeSpecificMetadata(
    data: CreateAssetWithMetadataDTO,
    file: Express.Multer.File,
    dictionaryFile?: Express.Multer.File
  ): Promise<void> {
    if (data.tipo === AssetType.DATASET) {
      // RF-1-2-5: Extraer primeras 5 filas para previsualización
      const metadata = data.metadata as DatasetMetadataDTO;
      const extension = FileHandler.getFileExtension(file.originalname);

      if (extension === 'csv') {
        metadata.previsualizacion = await FileHandler.extractCSVPreview(file, 5);
      } else if (extension === 'json') {
        metadata.previsualizacion = await FileHandler.extractJSONPreview(file, 5);
      }

      // Guardar diccionario de datos si se proporcionó
      if (dictionaryFile) {
        const dictValidation = FileValidationService.validateDictionaryFormat(dictionaryFile);
        if (!dictValidation.valid) {
          throw new Error(dictValidation.error || 'Formato de diccionario inválido');
        }

        const dictPath = await FileHandler.saveFile(dictionaryFile, 'dictionaries');
        metadata.diccionarioRuta = dictPath;
      }
    }
  }

  /**
   * CU1-2: Validar Metadatos
   * RF-1-2-1 a RF-1-2-7: Validación específica según tipo
   */
  async validateAssetMetadata(
    data: CreateAssetWithMetadataDTO,
    file?: Express.Multer.File
  ): Promise<ValidationResultDTO> {
    try {
      // RF-1-2-1: Identificar tipo y obtener validador
      const factory = FactoryProducer.getFactory(data.tipo);
      const validator = factory.getValidator();

      // Crear instancia temporal para validar
      const asset = factory.createAsset(data);

      // Ejecutar validación
      const errors = await validator.validate(asset, file);

      return {
        valido: errors.length === 0,
        errores: errors
      };
    } catch (error) {
      return {
        valido: false,
        errores: [{
          campo: 'general',
          mensaje: (error as Error).message,
          regla: 'error'
        }]
      };
    }
  }

  /**
   * Obtiene un activo por ID
   */
  async getAssetById(id: number): Promise<AssetResponseDTO | null> {
    try {
      const asset = await this.repository.findById(id);
      return asset ? this.mapAssetToResponse(asset) : null;
    } catch (error) {
      throw new Error(`Error al obtener activo: ${(error as Error).message}`);
    }
  }

  /**
   * Busca un activo por su DOI (solo aplicable a Papers)
   */
  async findByDoi(doi: string): Promise<AssetResponseDTO | null> {
    try {
      const asset = await this.repository.findByDoi(doi);
      return asset ? this.mapAssetToResponse(asset) : null;
    } catch (error) {
      throw new Error(`Error al buscar activo por DOI: ${(error as Error).message}`);
    }
  }

  /**
   * Obtiene activos del investigador
   */
  async getAssetsByCreator(creadorId: number): Promise<AssetResponseDTO[]> {
    try {
      const assets = await this.repository.findByCreator(creadorId);
      return assets.map(asset => this.mapAssetToResponse(asset));
    } catch (error) {
      throw new Error(`Error al obtener activos del creador: ${(error as Error).message}`);
    }
  }

  /**
   * Obtiene borradores del investigador
   */
  async getDraftsByCreator(creadorId: number): Promise<AssetResponseDTO[]> {
    try {
      const assets = await this.repository.findByCreator(creadorId);
      const drafts = assets.filter(asset => asset.asset.estado === AssetState.BORRADOR);
      return drafts.map(asset => this.mapAssetToResponse(asset));
    } catch (error) {
      throw new Error(`Error al obtener borradores: ${(error as Error).message}`);
    }
  }

  /**
   * Envía un activo a revisión
   * CU1-4: Enviar Activo a Revisores
   */
  async submitForReview(id: number, creadorId: number): Promise<void> {
    try {
      const asset = await this.repository.findById(id);

      if (!asset) {
        throw new Error('Activo no encontrado');
      }

      if (asset.asset.creadorId !== creadorId) {
        throw new Error('No tienes permisos para enviar este activo a revisión');
      }

      if (asset.asset.estado !== AssetState.BORRADOR) {
        throw new Error('Solo se pueden enviar borradores a revisión');
      }

      // Cambiar estado a "En Revisión"
      await this.repository.updateState(id, AssetState.EN_REVISION);

      // CU1-7: Registrar cambio en bitácora
      await this.registerChange(
        id,
        creadorId,
        ChangeType.MODIFICADO,
        AssetState.EN_REVISION,
        AssetState.BORRADOR,
        'Activo enviado a revisión'
      );
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  /**
   * CU1-3: Gestionar Borrador - Modificar
   * RF-1-3-4: Editar metadatos y/o archivo del borrador
   */
  async updateAsset(
    id: number,
    updateData: UpdateAssetDTO,
    creadorId: number,
    file?: Express.Multer.File,
    dictionaryFile?: Express.Multer.File
  ): Promise<AssetResponseDTO> {
    try {
      
      // Obtener activo existente
      const asset = await this.repository.findById(id);

      if (!asset) {
        throw new Error('Activo no encontrado');
      }

      // RF-1-3-8: Validar que esté en estado editable
      if (asset.asset.estado !== AssetState.BORRADOR && asset.asset.estado !== AssetState.RECHAZADO) {
        throw new Error('Solo se pueden editar activos en estado Borrador o Rechazado');
      }

      // Validar permisos
      if (asset.asset.creadorId !== creadorId) {
        throw new Error('No tienes permisos para editar este activo');
      }

      const estadoAnterior = asset.asset.estado;

      // Actualizar campos si vienen en el DTO
      if (updateData.titulo) {
        asset.asset.titulo = updateData.titulo;
      }

      if (updateData.confidencialidad) {
        asset.asset.confidencialidad = updateData.confidencialidad;
      }

      // Si viene nuevo archivo, procesarlo
      if (file) {
        // Validar archivo
        const fileValidation = await FileValidationService.validateFile(file, asset.asset.tipo);
        if (!fileValidation.valid) {
          throw new Error(`Errores de validación de archivo: ${fileValidation.errors.join(', ')}`);
        }

        // Eliminar archivo anterior
        await FileHandler.deleteFile(asset.asset.archivoRuta);

        // Guardar nuevo archivo
        const subfolder = this.getSubfolderByType(asset.asset.tipo);
        asset.asset.archivoRuta = await FileHandler.saveFile(file, subfolder);
        // Si es dataset, reprocesar previsualización
        if (asset.asset.tipo === AssetType.DATASET && updateData.metadata) {
          const metadata = updateData.metadata as DatasetMetadataDTO;
          const extension = FileHandler.getFileExtension(file.originalname);

          if (extension === 'csv') {
            metadata.previsualizacion = await FileHandler.extractCSVPreview(file, 5);
          } else if (extension === 'json') {
            metadata.previsualizacion = await FileHandler.extractJSONPreview(file, 5);
          }
        }
      }

      if (asset.asset.tipo === AssetType.DATASET && dictionaryFile) {
     
      
      const dictValidation = FileValidationService.validateDictionaryFormat(dictionaryFile);
      if (!dictValidation.valid) {
        throw new Error(dictValidation.error || 'Formato de diccionario inválido');
      }

      // Eliminar diccionario anterior si existe
      if ((asset.asset as Dataset).diccionarioRuta) {
        await FileHandler.deleteFile((asset.asset as Dataset).diccionarioRuta);
      }

      const dictPath = await FileHandler.saveFile(dictionaryFile, 'dictionaries');
      
      
      // ✅ Actualizar directamente en el asset
      (asset.asset as Dataset).diccionarioRuta = dictPath;
      
      
    }

      // Actualizar metadatos si vienen
      if (updateData.metadata) {
        this.updateAssetMetadata(asset.asset, updateData.metadata);
      }

      // Procesar diccionario si es dataset y viene archivo
      if (asset.asset.tipo === AssetType.DATASET && dictionaryFile && updateData.metadata) {
        const dictValidation = FileValidationService.validateDictionaryFormat(dictionaryFile);
        if (!dictValidation.valid) {
          throw new Error(dictValidation.error || 'Formato de diccionario inválido');
        }

        const dictPath = await FileHandler.saveFile(dictionaryFile, 'dictionaries');
        (updateData.metadata as DatasetMetadataDTO).diccionarioRuta = dictPath;
      }

      // Validar activo actualizado solo si hay cambios significativos
      const validatorFactory = FactoryProducer.getFactory(asset.asset.tipo);
      const assetValidator = validatorFactory.getValidator();
      
      // Solo pasar el archivo a la validación si realmente se subió uno nuevo
      const errors = await assetValidator.validate(asset.asset, file);

      if (errors.length > 0) {
        // Filtrar error de archivo si no se intentó cambiar el archivo
        const relevantErrors = file 
          ? errors 
          : errors.filter(e => e.campo !== 'archivo');

        if (relevantErrors.length > 0) {
          throw new Error(
            `Errores de validación: ${relevantErrors.map(e => `${e.campo}: ${e.mensaje}`).join('; ')}`
          );
        }
      }

      // Si estaba rechazado, volver a borrador
      if (asset.asset.estado === AssetState.RECHAZADO) {
        asset.asset.estado = AssetState.BORRADOR;
        await this.repository.updateState(id, AssetState.BORRADOR);
      }

      // Actualizar en base de datos
      await this.repository.update(id, asset.asset);

      // RF-1-3-5: Registrar modificación en bitácora
      await this.registerChange(
        id,
        creadorId,
        ChangeType.MODIFICADO,
        asset.asset.estado,
        estadoAnterior,
        'Activo modificado por el investigador'
      );

      return this.mapAssetToResponse(asset);
    } catch (error) {
      throw new Error(`Error al actualizar activo: ${(error as Error).message}`);
    }
  }

  /**
   * Actualiza metadatos del activo según su tipo
   */
  private updateAssetMetadata(asset: Asset, metadata: any): void {
    //console.log('Actualizando metadatos con:', metadata);
    if (asset instanceof Paper) {
      if (metadata.resumen) asset.resumen = metadata.resumen;
      if (metadata.doi) asset.doi = metadata.doi;
      if (metadata.referencias) asset.referencias = metadata.referencias;
      if (metadata.etiquetasIds) asset.etiquetasIds = metadata.etiquetasIds;
    } else if (asset instanceof Dataset) {
      if (metadata.previsualizacion) asset.previsualizacion = metadata.previsualizacion;
      
      if (metadata.diccionarioRuta) asset.diccionarioRuta = metadata.diccionarioRuta;
      if (metadata.licencia) asset.licencia = metadata.licencia;
      if (metadata.etiquetasIds) asset.etiquetasIds = metadata.etiquetasIds;
    } else if (asset instanceof Code) {
      if (metadata.repositorio) asset.repositorio = metadata.repositorio;
      if (metadata.lenguaje) asset.lenguaje = metadata.lenguaje;
      if (metadata.framework) asset.framework = metadata.framework;
      if (metadata.dependencias) asset.dependencias = metadata.dependencias;
      if (metadata.etiquetasIds) asset.etiquetasIds = metadata.etiquetasIds;
    } else if (asset instanceof TechnicalDocument) {
      if (metadata.idProyecto) asset.idProyecto = metadata.idProyecto;
      if (metadata.cliente) asset.cliente = metadata.cliente;
      if (metadata.etiquetasIds) asset.etiquetasIds = metadata.etiquetasIds;
    }
  }

  /**
   * CU1-3: Gestionar Borrador - Eliminar
   * RF-1-3-6 y RF-1-3-7: Eliminar borrador con confirmación
   */
  async deleteAsset(id: number, deleteData: DeleteAssetDTO): Promise<void> {
    try {
      // RF-1-3-6: Verificar confirmación
      if (!deleteData.confirmacion) {
        throw new Error('Se requiere confirmación para eliminar el borrador');
      }

      // Obtener activo
      const asset = await this.repository.findById(id);

      if (!asset) {
        throw new Error('Activo no encontrado');
      }

      // RF-1-3-8: Validar que esté en estado editable
      if (asset.asset.estado !== AssetState.BORRADOR && asset.asset.estado !== AssetState.RECHAZADO) {
        throw new Error('Solo se pueden eliminar activos en estado Borrador o Rechazado');
      }

      // Validar permisos
      if (asset.asset.creadorId !== deleteData.usuarioId) {
        throw new Error('No tienes permisos para eliminar este activo');
      }

      const estadoAnterior = asset.asset.estado;
      // IMPORTANTE: Registrar eliminación ANTES de borrar el activo
      // Para evitar error de foreign key
      await this.registerChange(
        id,
        deleteData.usuarioId,
        ChangeType.ELIMINADO,
        'ELIMINADO',
        estadoAnterior,
        'Borrador eliminado permanentemente por el investigador'
      );

      // Eliminar archivo físico
      await FileHandler.deleteFile(asset.asset.archivoRuta);

      // Si es dataset, eliminar diccionario
      if (asset instanceof Dataset && asset.diccionarioRuta) {
        await FileHandler.deleteFile(asset.diccionarioRuta);
      }

      // RF-1-3-7: Eliminar permanentemente de base de datos
      await this.repository.deletePermanently(id);
    } catch (error) {
      throw new Error(`Error al eliminar activo: ${(error as Error).message}`);
    }
  }

  /**
   * CU1-8: Retirar Publicación
   * RF-1-8-1 a RF-1-8-6
   */
  async withdrawAsset(id: number, withdrawData: WithdrawAssetDTO): Promise<void> {
    try {
      // RF-1-8-2: Validar justificación obligatoria
      if (!withdrawData.justificacion || withdrawData.justificacion.trim() === '') {
        throw new Error('La justificación del retiro es obligatoria');
      }

      // Obtener activo
      const asset = await this.repository.findById(id);

      if (!asset) {
        throw new Error('Activo no encontrado');
      }

      // Validar que esté publicado
      if (asset.asset.estado !== AssetState.PUBLICADO) {
        throw new Error('Solo se pueden retirar activos en estado Publicado');
      }

      // Notificar
       const temp = this.mapAssetToResponse(asset);
       await this.notificationService.NotificarDecicision(temp, AssetState.RETIRADO, withdrawData.justificacion);

      // RF-1-8-3: Cambiar estado a Retirado
      await this.repository.updateState(id, AssetState.RETIRADO);

      // RF-1-8-6: Registrar retiro con justificación
      await this.registerChange(
        id,
        withdrawData.administradorId,
        ChangeType.RETIRADO,
        AssetState.RETIRADO,
        AssetState.PUBLICADO,
        `Retiro de publicación: ${withdrawData.justificacion}`
      );
    } catch (error) {
      throw new Error(`Error al retirar publicación: ${(error as Error).message}`);
    }
  }

  /**
   * CU1-7: Registrar Cambio
   * RF-1-7-1 a RF-1-7-7: Registrar en bitácora de cambios
   */
  private async registerChange(
    activoId: number,
    usuarioId: number,
    tipoCambio: ChangeType,
    estadoNuevo?: string,
    estadoAnterior?: string,
    comentarios?: string
  ): Promise<void> {
    try {
      const auditLog = new AuditLog(
        activoId,
        usuarioId,
        tipoCambio,
        estadoNuevo,
        estadoAnterior,
        comentarios
      );

      await this.guardarRegistoCompleto.create(auditLog);
    } catch (error) {
      // RF-1-7-7: Notificar error pero no bloquear operación
      console.error('Error al registrar cambio en bitácora:', error);
      throw new Error('Error al registrar el cambio en la bitácora. Intente nuevamente.');
    }
  }

  /**
   * Obtiene el historial de cambios de un activo
   * CU1-7: Consultar bitácora
   */
  async getAssetHistory(id: number): Promise<AuditLogResponseDTO[]> {
    try {
      const logs = await this.asociarCambioAlID.findByAssetId(id);
      
      return logs.map(log => ({
        id: log.id!,
        activoId: log.activoId,
        usuarioId: log.usuarioId,
        tipoCambio: log.tipoCambio,
        estadoAnterior: log.estadoAnterior,
        estadoNuevo: log.estadoNuevo,
        comentarios: log.comentarios,
        fecha: log.fecha
      }));
    } catch (error) {
      throw new Error(`Error al obtener historial: ${(error as Error).message}`);
    }
  }

  /**
   * Obtiene borradores y rechazados del investigador
   * CU1-3: RF-1-3-1: Filtrar por estado
   */
  async getDraftsAndRejected(creadorId: number): Promise<AssetResponseDTO[]> {
    try {
      const drafts = await this.repository.findByCreatorAndState(creadorId, AssetState.BORRADOR);
      const rejected = await this.repository.findByCreatorAndState(creadorId, AssetState.RECHAZADO);
      
      const all = [...drafts, ...rejected];
      return all.map(asset => this.mapAssetToResponse(asset));
    } catch (error) {
      throw new Error(`Error al obtener borradores: ${(error as Error).message}`);
    }
  }

  /**
   * Mapea Asset a DTO de respuesta
   */
  private mapAssetToResponse(result: AssetWithTags): AssetResponseDTO {
    const asset = result.asset;
    
    // NUEVO: Extraer etiquetasIds del asset según su tipo
    let etiquetasIds: number[] = [];
    
    if (asset instanceof Paper) {
      etiquetasIds = asset.etiquetasIds || [];
    } else if (asset instanceof Dataset) {
      etiquetasIds = asset.etiquetasIds || [];
    } else if (asset instanceof Code) {
      etiquetasIds = asset.etiquetasIds || [];
    } else if (asset instanceof TechnicalDocument) {
      etiquetasIds = asset.etiquetasIds || [];
    }
    
    return {
      id: asset.id!,
      tipo: asset.tipo,
      titulo: asset.titulo,
      estado: asset.estado,
      confidencialidad: asset.confidencialidad,
      archivoRuta: asset.archivoRuta,
      fechaCreacion: asset.fechaCreacion,
      fechaActualizacion: asset.fechaActualizacion,
      creadorId: asset.creadorId,
      etiquetasIds: etiquetasIds, // AHORA SÍ SE INCLUYE
      etiquetas: result.etiquetas, // Nombres de las etiquetas (opcional)
      metadata: asset.getMetadata()
    };
  }

  /**
   * Obtiene subcarpeta según tipo de activo
   */
  private getSubfolderByType(tipo: AssetType): string {
    const folders: Record<AssetType, string> = {
      [AssetType.PAPER]: 'papers',
      [AssetType.DATASET]: 'datasets',
      [AssetType.CODIGO]: 'code',
      [AssetType.DOCUMENTO_TECNICO]: 'documents'
    };
    return folders[tipo];
  }

  /*
    CU1-5 Revisión/Aprobación de Activo
    RF-1-5-1: Se debe permitir al revisor acceder a su lista de activos pendientes de revisión.
   */
  async findByState(estado: AssetState): Promise<AssetResponseDTO[]> {
    try {
      // Llamada al repositorio
      const assets = await this.repository.findByState(estado);

      // Mapear a DTO de respuesta
      return assets.map(asset => this.mapAssetToResponse(asset));
    } catch (error) {
      throw new Error(`Error en el servicio al buscar activos por estado: ${(error as Error).message}`);
    }
  }

    /**
   * Obtiene todos los activos con sus metadatos
   */
  async getAllAssets(): Promise<AssetResponseDTO[]> {
    try {
      const assets = await this.repository.findAll();
      return assets.map(asset => this.mapAssetToResponse(asset));
    } catch (error) {
      throw new Error(`Error al obtener todos los activos: ${(error as Error).message}`);
    }
  }

  async updateAssetState(id: number, nuevoEstado: AssetState): Promise<{ success: boolean }> {
    try {
      // Llamada al repositorio
      await this.repository.updateState(id, nuevoEstado);

      return { success: true };
    } catch (error) {
      throw new Error(`Error en el servicio al actualizar estado: ${(error as Error).message}`);
    }
  }

    /**
   * Obtiene activos filtrados por tipo
   */
  async getAssetsByType(tipo: AssetType): Promise<AssetResponseDTO[]> {
    try {
      const assets = await this.repository.findByType(tipo);
      return assets.map(asset => this.mapAssetToResponse(asset));
    } catch (error) {
      throw new Error(`Error al obtener activos por tipo: ${(error as Error).message}`);
    }
  }


async getPublishedAssetsByCreator(
    creadorId: number,
    allowedConf: Confidentiality[],
    limit = 20
  ): Promise<AssetResponseDTO[]> {
    const rows = await this.repository.findByCreatorFiltered(creadorId, {
      estados: [AssetState.PUBLICADO],
      confidencialidades: allowedConf,
      limit,
    });
    return rows.map(r => this.mapAssetToResponse(r));
  }

  async getPublishedAssetsByTag(
    etiquetaId: number,
    allowedConf: Confidentiality[],
    limit = 20
  ): Promise<AssetResponseDTO[]> {
    const rows = await this.repository.findByTagFiltered(etiquetaId, {
      estados: [AssetState.PUBLICADO],
      confidencialidades: allowedConf,
      limit,
    });
    return rows.map(r => this.mapAssetToResponse(r));
  }

  async getPublishedAssetsByTagIds(
    etiquetaIds: number[],
    allowedConf: Confidentiality[],
    limit = 20
  ): Promise<AssetResponseDTO[]> {
    const rows = await this.repository.findByTagIdsFiltered(etiquetaIds, {
      estados: [AssetState.PUBLICADO],
      confidencialidades: allowedConf,
      limit,
    });
    return rows.map(r => this.mapAssetToResponse(r));
  }


  async findArchivoRutaById(activoId: number): Promise<string | null>{
    return this.repository.findArchivoRutaById(activoId)
  }

}
