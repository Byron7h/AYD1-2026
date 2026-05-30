// src/controllers/AssetController.ts
// Controller (MVC): capa HTTP del componente assets.

import { Request, Response } from 'express';
import { AssetService } from '../services/AssetService';
import { CreateAssetWithMetadataDTO, UpdateAssetDTO, DeleteAssetDTO, WithdrawAssetDTO } from '../dto/AssetDTO';

//../dtos/AssetDTO
import { AssetType } from '../types/AssetType';
import { Confidentiality } from '../types/AssetState';


/**
 * Controlador para endpoints de gestión de activos
 * Maneja las peticiones HTTP y coordina con el servicio
 */
export class AssetController {

  public constructor(private service: AssetService) {
    
  }

  /**
   * POST /api/assets
   * CU1-1: Subir Activo (Borrador)
   * RF-1-1-1 a RF-1-1-7
   */


  createAsset = async (req: Request, res: Response): Promise<void> => {
    try {
      // 🔹 Obtener archivos desde Multer (upload.fields)
      const files = req.files as {
        [fieldname: string]: Express.Multer.File[];
      };

      const file = files?.file?.[0];
      const dictionaryFile = files?.dictionary?.[0];

      // 🔴 Validar archivo principal
      if (!file) {
        res.status(400).json({
          success: false,
          message: 'No se ha proporcionado ningún archivo'
        });
        return;
      }

      // 🔹 Obtener datos del body
      const { tipo, titulo, metadata, confidencialidad } = req.body;
      //console.log('Received body:', req.body);
      

      // 🔴 Validar campos obligatorios
      if (!tipo || !titulo || !metadata) {
        res.status(400).json({
          success: false,
          message: 'Faltan campos obligatorios: tipo, titulo, metadata'
        });
        return;
      }

      // 🔹 Normalizar tipo (por seguridad)
      const normalizedType = String(tipo);

      

      // 🔴 Validar tipo de activo
      if (!Object.values(AssetType).includes(normalizedType as AssetType)) {
        res.status(400).json({
          success: false,
          message: `Tipo de activo inválido: ${tipo}`
        });
        return;
      }
      // 🔹 Parsear metadata (viene como string JSON)
      let parsedMetadata: any;
      try {
        parsedMetadata =
          typeof metadata === 'string' ? JSON.parse(metadata) : metadata;
      } catch {
        res.status(400).json({
          success: false,
          message: 'Los metadatos no tienen un formato JSON válido'
        });
        return;
      }

      //console.log('Parsed Metadata:', parsedMetadata);

      // 🔹 Usuario temporal (mock)
      //const creadorId = Number(req.body.creadorId ?? 1);
      const creadorId = req.user!.id;
      // 🔹 Normalizar confidencialidad
      const normalizedConfidentiality = confidencialidad
        ? String(confidencialidad)
        : Confidentiality.PUBLICO;

      // 🔴 Validar confidencialidad
      if (
        !Object.values(Confidentiality).includes(
          normalizedConfidentiality as Confidentiality
        )
      ) {
        res.status(400).json({
          success: false,
          message: `Nivel de confidencialidad inválido: ${confidencialidad}`
        });
        return;
      }

      // 🔹 Construir DTO
      const assetData: CreateAssetWithMetadataDTO = {
        tipo: normalizedType as AssetType,
        titulo,
        creadorId,
        archivoRuta: '', // Se asigna en el servicio
        metadata: parsedMetadata,
        confidencialidad: normalizedConfidentiality as Confidentiality
      };

      // 🔹 Crear activo
      const result = await this.service.createAsset(
        assetData,
        file,
        dictionaryFile
      );

      // ✅ Respuesta exitosa
      res.status(201).json({
        success: true,
        message: 'Borrador creado exitosamente',
        data: result
      });
    } catch (error) {
      console.error('Error al crear activo:', error);
      res.status(500).json({
        success: false,
        message: (error as Error).message
      });
    }
  };
  


  /**
   * POST /api/assets/validate
   * CU1-2: Validar Metadatos
   */
  validateMetadata = async (req: Request, res: Response): Promise<void> => {
    try {
      const { tipo, titulo, metadata, confidencialidad } = req.body;

      if (!tipo || !titulo || !metadata) {
        res.status(400).json({
          success: false,
          message: 'Faltan campos obligatorios: tipo, titulo, metadata'
        });
        return;
      }

      // Parsear metadata
      let parsedMetadata;
      try {
        parsedMetadata = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;
      } catch {
        res.status(400).json({
          success: false,
          message: 'Los metadatos no tienen un formato JSON válido'
        });
        return;
      }
      const creatorId = req.user!.id;

      const assetData: CreateAssetWithMetadataDTO = {
        tipo: tipo as AssetType,
        titulo,
        creadorId: creatorId, // Temporal para validación
        archivoRuta: 'temp',
        metadata: parsedMetadata,
        confidencialidad: confidencialidad as Confidentiality
      };

      const validation = await this.service.validateAssetMetadata(assetData, req.file);

      res.status(200).json({
        success: true,
        data: validation
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: (error as Error).message
      });
    }
  };

  /**
   * GET /api/assets/:id
   * Obtiene un activo por ID
   */
  getAssetById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const asset = await this.service.getAssetById(parseInt(id));

      if (!asset) {
        res.status(404).json({
          success: false,
          message: 'Activo no encontrado'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: asset
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: (error as Error).message
      });
    }
  };

  /**
   * GET /api/assets/my-assets
   * CU1-3: Obtiene activos del investigador autenticado
   */
  getMyAssets = async (req: Request, res: Response): Promise<void> => {
    try {
      // TEMPORAL: Usuario mock (ELIMINAR cuando auth esté listo)
      //const creadorId = parseInt(req.query.creadorId as string || '1');
      const creadorId = req.user!.id;
      const assets = await this.service.getAssetsByCreator(creadorId);

      res.status(200).json({
        success: true,
        data: assets
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: (error as Error).message
      });
    }
  };

  /**
   * GET /api/assets/my-drafts
   * CU1-3: Obtiene borradores del investigador
   */
  getMyDrafts = async (req: Request, res: Response): Promise<void> => {
    try {
      // TEMPORAL: Usuario mock (ELIMINAR cuando auth esté listo)
      //const creadorId = parseInt(req.query.creadorId as string || '1');
      const creadorId = req.user!.id;
      const drafts = await this.service.getDraftsByCreator(creadorId);

      res.status(200).json({
        success: true,
        data: drafts
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: (error as Error).message
      });
    }
  };

  /**
   * PUT /api/assets/:id/submit
   * CU1-4: Enviar activo a revisión
   */
  submitForReview = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      // TEMPORAL: Usuario mock (ELIMINAR cuando auth esté listo)
      const creadorId = req.user!.id;

      await this.service.submitForReview(parseInt(id), creadorId);

      res.status(200).json({
        success: true,
        message: 'Activo enviado a revisión exitosamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: (error as Error).message
      });
    }
  };

  /**
   * PUT /api/assets/:id
   * CU1-3: Modificar Borrador
   * RF-1-3-4: Editar metadatos y/o archivo
   */
  updateAsset = async (req: Request, res: Response): Promise<void> => {
    try {

      
      const { id } = req.params;
      const { metadata, titulo, confidencialidad } = req.body;

      // TEMPORAL: Usuario mock
      const creadorId = req.user!.id;

      // Parsear metadata si viene como string
      let parsedMetadata;
      if (metadata) {
        try {
          parsedMetadata = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;
        } catch {
          res.status(400).json({
            success: false,
            message: 'Los metadatos no tienen un formato JSON válido'
          });
          return;
        }
      }

      // Construir DTO de actualización
      const updateData: UpdateAssetDTO = {
        titulo,
        confidencialidad: confidencialidad as Confidentiality,
        metadata: parsedMetadata
      };

      // Obtener archivos si vienen
      const file = (req.files as any)?.file?.[0];
      const dictionaryFile = (req.files as any)?.dictionary?.[0];
      //console.log('Dictionary File:', file);

      // Actualizar activo
      const result = await this.service.updateAsset(
        parseInt(id),
        updateData,
        creadorId,
        file,
        dictionaryFile
      );

      res.status(200).json({
        success: true,
        message: 'Activo actualizado exitosamente',
        data: result
      });
    } catch (error) {
      console.error('Error al actualizar activo:', error);
      res.status(500).json({
        success: false,
        message: (error as Error).message
      });
    }
  };

  /**
   * DELETE /api/assets/:id
   * CU1-3: Eliminar Borrador
   * RF-1-3-6: Confirmación expresa antes de eliminar
   */
  deleteAsset = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { confirmacion } = req.body;

      // TEMPORAL: Usuario mock
      //const usuarioId = parseInt(req.body.creadorId || req.body.usuarioId || '1');
      const usuarioId = req.user!.id;
      if (confirmacion === undefined || confirmacion === null) {
        res.status(400).json({
          success: false,
          message: 'Se requiere el campo "confirmacion" (true/false)'
        });
        return;
      }

      const deleteData: DeleteAssetDTO = {
        confirmacion: confirmacion === true || confirmacion === 'true',
        usuarioId
      };

      await this.service.deleteAsset(parseInt(id), deleteData);

      res.status(200).json({
        success: true,
        message: 'Borrador eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar activo:', error);
      res.status(500).json({
        success: false,
        message: (error as Error).message
      });
    }
  };

  /**
   * GET /api/assets/:id/history
   * CU1-7: Obtener historial de cambios del activo
   */
  getAssetHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const history = await this.service.getAssetHistory(parseInt(id));

      res.status(200).json({
        success: true,
        data: history
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: (error as Error).message
      });
    }
  };

  /**
   * GET /api/assets/my-drafts-rejected
   * CU1-3: Obtener borradores y rechazados
   * RF-1-3-1: Filtrar por estado
   */
  getDraftsAndRejected = async (req: Request, res: Response): Promise<void> => {
    try {
      // TEMPORAL: Usuario mock
      //const creadorId = parseInt(req.query.creadorId as string || '1');
      const creadorId = req.user!.id;
      const assets = await this.service.getDraftsAndRejected(creadorId);

      res.status(200).json({
        success: true,
        data: assets
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: (error as Error).message
      });
    }
  };

  /**
   * PUT /api/assets/:id/withdraw
   * CU1-8: Retirar Publicación
   * RF-1-8-2: Justificación obligatoria
   */
  withdrawAsset = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { justificacion } = req.body;

      // TEMPORAL: Usuario mock (admin)
      //const administradorId = parseInt(req.body.administradorId || '1');
      const administradorId = req.user!.id;
      if (!justificacion || justificacion.trim() === '') {
        res.status(400).json({
          success: false,
          message: 'La justificación del retiro es obligatoria'
        });
        return;
      }

      const withdrawData: WithdrawAssetDTO = {
        justificacion,
        administradorId
      };

      await this.service.withdrawAsset(parseInt(id), withdrawData);

      res.status(200).json({
        success: true,
        message: 'Publicación retirada exitosamente'
      });
    } catch (error) {
      console.error('Error al retirar publicación:', error);
      res.status(500).json({
        success: false,
        message: (error as Error).message
      });
    }
  };

  /**
   * GET /api/assets
   * CU1-9: Listar todos los activos (Administradores)
   */
  getAllAssets = async (req: Request, res: Response): Promise<void> => {
    try {
      const assets = await this.service.getAllAssets(); 
      res.status(200).json({
        success: true,
        data: assets
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: (error as Error).message
      });
    }
  };

    /**
   * GET /api/assets/by-type?tipo=Paper|Dataset|Codigo|Documento Tecnico
   * Filtra activos por tipo
   */
  getAssetsByType = async (req: Request, res: Response): Promise<void> => {
    try {
      const { tipo } = req.query;
      if (!tipo || !Object.values(AssetType).includes(tipo as AssetType)) {
        res.status(400).json({
          success: false,
          message: 'Tipo de activo inválido o no especificado'
        });
        return;
      }

      const assets = await this.service.getAssetsByType(tipo as AssetType);

      res.status(200).json({
        success: true,
        data: assets
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: (error as Error).message
      });
    }
  };
}
