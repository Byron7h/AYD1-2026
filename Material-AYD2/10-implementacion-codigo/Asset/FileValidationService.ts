// src/services/FileValidationService.ts

import { AssetType, ASSET_TYPE_FORMATS, DICTIONARY_FORMATS } from '../types/AssetType';
import { FileHandler } from '../utils/fileHandler';

/**
 * Servicio para validación de estructura de archivos
 * DR-2 a DR-6: Validación de formatos permitidos
 */
export class FileValidationService {
  /**
   * Valida que el formato del archivo sea el correcto para el tipo de activo
   * @param file - Archivo a validar
   * @param assetType - Tipo de activo
   * @returns true si el formato es válido
   */
  static validateFormat(file: Express.Multer.File, assetType: AssetType): {
    valid: boolean;
    error?: string;
  } {
    const extension = FileHandler.getFileExtension(file.originalname);
    const allowedFormats = ASSET_TYPE_FORMATS[assetType];

    if (!allowedFormats.includes(extension)) {
      return {
        valid: false,
        error: `Formato no válido para ${assetType}. Formatos permitidos: ${allowedFormats.join(', ')}`
      };
    }

    return { valid: true };
  }

  /**
   * Valida el formato del diccionario de datos (solo para Datasets)
   * DR-4: Formatos permitidos para diccionario
   */
  static validateDictionaryFormat(file: Express.Multer.File): {
    valid: boolean;
    error?: string;
  } {
    const extension = FileHandler.getFileExtension(file.originalname);

    if (!DICTIONARY_FORMATS.includes(extension)) {
      return {
        valid: false,
        error: `Formato de diccionario no válido. Formatos permitidos: ${DICTIONARY_FORMATS.join(', ')}`
      };
    }

    return { valid: true };
  }

  /**
   * Valida el tamaño del archivo según el tipo
   * @param file - Archivo a validar
   * @param assetType - Tipo de activo
   * @returns true si el tamaño es válido
   */
  static validateSize(file: Express.Multer.File, assetType: AssetType): {
    valid: boolean;
    error?: string;
  } {
    // Límites por tipo (en MB)
    const sizeLimits: Record<AssetType, number> = {
      [AssetType.PAPER]: 10,
      [AssetType.DATASET]: 100,
      [AssetType.CODIGO]: 50,
      [AssetType.DOCUMENTO_TECNICO]: 25
    };

    const maxSize = sizeLimits[assetType];
    const isValid = FileHandler.validateFileSize(file, maxSize);

    if (!isValid) {
      return {
        valid: false,
        error: `El archivo excede el tamaño máximo permitido de ${maxSize}MB para ${assetType}`
      };
    }

    return { valid: true };
  }

  /**
   * Valida la estructura de un CSV (que tenga headers y datos)
   * @param file - Archivo CSV
   * @returns Resultado de validación
   */
  static async validateCSVStructure(file: Express.Multer.File): Promise<{
    valid: boolean;
    error?: string;
  }> {
    try {
      const preview = await FileHandler.extractCSVPreview(file, 1);
      const data = JSON.parse(preview);

      if (!Array.isArray(data) || data.length === 0) {
        return {
          valid: false,
          error: 'El archivo CSV no contiene datos válidos'
        };
      }

      // Verificar que tenga al menos una columna
      const firstRow = data[0];
      if (!firstRow || Object.keys(firstRow).length === 0) {
        return {
          valid: false,
          error: 'El archivo CSV no tiene columnas definidas'
        };
      }

      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: `Error al validar estructura CSV: ${(error as Error).message}`
      };
    }
  }

  /**
   * Valida la estructura de un JSON (que sea válido y tenga contenido)
   * @param file - Archivo JSON
   * @returns Resultado de validación
   */
  static async validateJSONStructure(file: Express.Multer.File): Promise<{
    valid: boolean;
    error?: string;
  }> {
    try {
      const content = file.buffer.toString('utf-8');
      const data = JSON.parse(content);

      if (!data || (Array.isArray(data) && data.length === 0) || 
          (typeof data === 'object' && Object.keys(data).length === 0)) {
        return {
          valid: false,
          error: 'El archivo JSON no contiene datos'
        };
      }

      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: `Error al validar estructura JSON: ${(error as Error).message}`
      };
    }
  }

  /**
   * Valida que un archivo ZIP no esté corrupto
   * @param file - Archivo ZIP
   * @returns Resultado de validación
   */
  static async validateZIPStructure(file: Express.Multer.File): Promise<{
    valid: boolean;
    error?: string;
  }> {
    try {
      // Verificar firma ZIP (PK\x03\x04)
      const signature = file.buffer.slice(0, 4);
      const zipSignature = Buffer.from([0x50, 0x4B, 0x03, 0x04]);

      if (!signature.equals(zipSignature)) {
        return {
          valid: false,
          error: 'El archivo no es un ZIP válido'
        };
      }

      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: `Error al validar estructura ZIP: ${(error as Error).message}`
      };
    }
  }

  /**
   * Validación completa de archivo según tipo de activo
   */
  static async validateFile(file: Express.Multer.File, assetType: AssetType): Promise<{
    valid: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];

    // Validar formato
    const formatResult = this.validateFormat(file, assetType);
    if (!formatResult.valid && formatResult.error) {
      errors.push(formatResult.error);
    }

    // Validar tamaño
    const sizeResult = this.validateSize(file, assetType);
    if (!sizeResult.valid && sizeResult.error) {
      errors.push(sizeResult.error);
    }

    // Validaciones específicas por tipo
    if (assetType === AssetType.DATASET) {
      const extension = FileHandler.getFileExtension(file.originalname);
      
      if (extension === 'csv') {
        const csvResult = await this.validateCSVStructure(file);
        if (!csvResult.valid && csvResult.error) {
          errors.push(csvResult.error);
        }
      } else if (extension === 'json') {
        const jsonResult = await this.validateJSONStructure(file);
        if (!jsonResult.valid && jsonResult.error) {
          errors.push(jsonResult.error);
        }
      }
    } else if (assetType === AssetType.CODIGO) {
      const extension = FileHandler.getFileExtension(file.originalname);
      
      if (extension === 'zip') {
        const zipResult = await this.validateZIPStructure(file);
        if (!zipResult.valid && zipResult.error) {
          errors.push(zipResult.error);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
