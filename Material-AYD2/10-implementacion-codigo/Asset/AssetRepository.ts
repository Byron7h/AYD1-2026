// src/repositories/AssetRepository.ts
// Repositorio (capa de persistencia) del componente assets.

import { IobtenerBase } from '../config/database';
import { myDb } from '../container/db.container';
import { Asset, Paper, Dataset, Code, TechnicalDocument } from '../models/Asset';

import { AssetType, AssetWithTags } from '../types/AssetType';
import { Confidentiality, AssetState } from '../types/AssetState';




/**
 * Repositorio para operaciones de base de datos de activos
 * Patrón: Repository Pattern
 */
export class AssetRepository {
  

  public constructor(private db: IobtenerBase = myDb) { }
  /**
   * Crea un nuevo activo en la base de datos
   * RF-1-1-6: Guardar activo en estado "Borrador"
   */
  async create(asset: Asset): Promise<number> {
    try {
      // Insertar en tabla ACTIVOS
      const result = await this.db.query<any>(
        `INSERT INTO ACTIVOS 
         (creador_id, tipo, titulo, estado, confidencialidad, archivo_ruta, fecha_creacion, fecha_actualizacion)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          asset.creadorId,
          asset.tipo,
          asset.titulo,
          asset.estado,
          asset.confidencialidad,
          asset.archivoRuta,
          asset.fechaCreacion,
          asset.fechaActualizacion
        ]
      );

      const activoId = result.insertId;

      // Insertar metadatos específicos según el tipo
      await this.insertMetadata(activoId, asset);

      // Insertar etiquetas
      await this.insertTags(activoId, asset);

      return activoId;
    } catch (error) {
      throw new Error(`Error al crear activo: ${(error as Error).message}`);
    }
  }

  /**
   * Inserta metadatos específicos según el tipo de activo
   */
  private async insertMetadata(activoId: number, asset: Asset): Promise<void> {
    if (asset instanceof Paper) {
      await this.db.query(
        `INSERT INTO PAPER_METADATOS (activo_id, resumen, doi, referencias)
         VALUES (?, ?, ?, ?)`,
        [activoId, asset.resumen, asset.doi || null, asset.referencias]
      );
    } else if (asset instanceof Dataset) {
      await this.db.query(
        `INSERT INTO DATASET_METADATOS (activo_id, previsualizacion, diccionario_ruta, licencia)
         VALUES (?, ?, ?, ?)`,
        [activoId, asset.previsualizacion, asset.diccionarioRuta, asset.licencia]
      );
    } else if (asset instanceof Code) {
      await this.db.query(
        `INSERT INTO CODIGO_METADATOS (activo_id, repositorio, lenguaje, framework, dependencias)
         VALUES (?, ?, ?, ?, ?)`,
        [activoId, asset.repositorio, asset.lenguaje, asset.framework, asset.dependencias]
      );
    } else if (asset instanceof TechnicalDocument) {
      await this.db.query(
        `INSERT INTO DOCUMENTO_TECNICO_METADATOS (activo_id, id_proyecto, cliente)
         VALUES (?, ?, ?)`,
        [activoId, asset.idProyecto, asset.cliente || null]
      );
    }
  }

  /**
   * Inserta etiquetas del activo
   */
  private async insertTags(activoId: number, asset: Asset): Promise<void> {
    const tags = this.getAssetTags(asset);

if (tags && tags.length > 0) {
    for (const tagId of tags) {
      await this.db.query(
        `INSERT INTO ACTIVO_ETIQUETAS (activo_id, etiqueta_id) VALUES (?, ?)`,
        [activoId, tagId]
      );
    }
  }
  }

  /**
   * Obtiene etiquetas según el tipo de activo
   */
  private getAssetTags(asset: Asset): number[] {
    if (asset instanceof Paper) return asset.etiquetasIds;
    if (asset instanceof Dataset) return asset.etiquetasIds;
    if (asset instanceof Code) return asset.etiquetasIds;
    if (asset instanceof TechnicalDocument) return asset.etiquetasIds;
    return [];
  }

  /**
   * Busca un activo por ID
   */
  async findById(id: number): Promise<AssetWithTags | null> {
    try {
      console.log('Buscando activo por ID en repositorio:', id);
      const rows = await this.db.query<any[]>(
        `SELECT * FROM ACTIVOS WHERE id = ?`,
        [id]
      );

      if (rows.length === 0) return null;

      return await this.mapToAsset(rows[0]);
    } catch (error) {
      throw new Error(`Error al buscar activo: ${(error as Error).message}`);
    }
  }

  /**
   * Busca un activo por su DOI (solo aplica a Papers)
   */
  async findByDoi(doi: string): Promise<AssetWithTags | null> {
    try {
      const rows = await this.db.query<any[]>(
        `
        SELECT a.* FROM ACTIVOS a
        INNER JOIN PAPER_METADATOS p ON p.activo_id = a.id
        WHERE p.doi = ?
        LIMIT 1
        `,
        [doi]
      );

      if (rows.length === 0) return null;

      return await this.mapToAsset(rows[0]);
    } catch (error) {
      throw new Error(`Error al buscar activo por DOI: ${(error as Error).message}`);
    }
  }

  /**
   * Busca activos por creador
   */
  async findByCreator(creadorId: number): Promise<AssetWithTags[]> {
    try {
      const rows = await this.db.query<any[]>(
        `SELECT * FROM ACTIVOS WHERE creador_id = ? ORDER BY fecha_creacion DESC`,
        [creadorId]
      );

      const assets: AssetWithTags[] = [];
      for (const row of rows) {
        const asset = await this.mapToAsset(row);
        if (asset) assets.push(asset);
      }

      return assets;
    } catch (error) {
      throw new Error(`Error al buscar activos del creador: ${(error as Error).message}`);
    }
  }

  /**
   * Busca activos por estado
   */
  async findByState(estado: AssetState): Promise<AssetWithTags[]> {
    try {
      const rows = await this.db.query<any[]>(
        `SELECT * FROM ACTIVOS WHERE estado = ? ORDER BY fecha_creacion DESC`,
        [estado]
      );

      const assets: AssetWithTags[] = [];
      for (const row of rows) {
        const asset = await this.mapToAsset(row);
        if (asset) assets.push(asset);
      }

      return assets;
    } catch (error) {
      throw new Error(`Error al buscar activos por estado: ${(error as Error).message}`);
    }
  }

  /**
   * Actualiza el estado de un activo
   * CU-1,5,6,8,7
   * RF1-4-2;1-5-4,1-6-3,1-8-3,1-7,5
   * EAC-6
   */
  async updateState(id: number, nuevoEstado: AssetState): Promise<void> {
    try {
      await this.db.query(
        `UPDATE ACTIVOS SET estado = ?, fecha_actualizacion = ? WHERE id = ?`,
        [nuevoEstado, new Date(), id]
      );
    } catch (error) {
      throw new Error(`Error al actualizar estado: ${(error as Error).message}`);
    }
  }

  /**
   * Mapea una fila de la BD a un objeto Asset
   */
private async mapToAsset(row: any): Promise<AssetWithTags | null> {
  const tipo = row.tipo as AssetType;

  const tagRows = await this.db.query<any[]>(
    `SELECT e.id as etiqueta_id, e.nombre as etiqueta_nombre
     FROM ACTIVO_ETIQUETAS ae
     JOIN ETIQUETAS e ON e.id = ae.etiqueta_id
     WHERE ae.activo_id = ?`,
    [row.id]
  );

  const etiquetaIds = tagRows.map(t => t.etiqueta_id as number);
  const etiquetas = tagRows.map(t => t.etiqueta_nombre as string);

  let asset: Asset | null = null;

  switch (tipo) {
    case AssetType.PAPER: {
      const paperMeta = await this.db.query<any[]>(
        `SELECT * FROM PAPER_METADATOS WHERE activo_id = ?`,
        [row.id]
      );
      if (paperMeta.length > 0) {
        asset = new Paper(
          row.creador_id,
          row.titulo,
          row.archivo_ruta,
          paperMeta[0].resumen,
          paperMeta[0].referencias,
          etiquetaIds,
          paperMeta[0].doi
        );
      }
      break;
    }

    case AssetType.DATASET: {
      const datasetMeta = await this.db.query<any[]>(
        `SELECT * FROM DATASET_METADATOS WHERE activo_id = ?`,
        [row.id]
      );
      if (datasetMeta.length > 0) {
        asset = new Dataset(
          row.creador_id,
          row.titulo,
          row.archivo_ruta,
          datasetMeta[0].previsualizacion,
          datasetMeta[0].diccionario_ruta,
          datasetMeta[0].licencia,
          etiquetaIds
        );
      }
      break;
    }

    case AssetType.CODIGO: {
      const codeMeta = await this.db.query<any[]>(
        `SELECT * FROM CODIGO_METADATOS WHERE activo_id = ?`,
        [row.id]
      );
      if (codeMeta.length > 0) {
        asset = new Code(
          row.creador_id,
          row.titulo,
          row.archivo_ruta,
          codeMeta[0].repositorio,
          codeMeta[0].lenguaje,
          codeMeta[0].framework,
          codeMeta[0].dependencias,
          etiquetaIds
        );
      }
      break;
    }

    case AssetType.DOCUMENTO_TECNICO: {
      const docMeta = await this.db.query<any[]>(
        `SELECT * FROM DOCUMENTO_TECNICO_METADATOS WHERE activo_id = ?`,
        [row.id]
      );
      if (docMeta.length > 0) {
        asset = new TechnicalDocument(
          row.creador_id,
          row.titulo,
          row.archivo_ruta,
          row.confidencialidad as Confidentiality,
          docMeta[0].id_proyecto,
          etiquetaIds,
          docMeta[0].cliente
        );
      }
      break;
    }
  }

  if (!asset) return null;

  asset.id = row.id;
  asset.estado = row.estado as AssetState;
  asset.fechaCreacion = new Date(row.fecha_creacion);
  asset.fechaActualizacion = new Date(row.fecha_actualizacion);

  return { asset, etiquetas };
}

  /**
   * Elimina un activo (soft delete - cambiar a estado "Retirado")
   */
  async delete(id: number): Promise<void> {
    try {
      await this.updateState(id, AssetState.RETIRADO);
    } catch (error) {
      throw new Error(`Error al eliminar activo: ${(error as Error).message}`);
    }
  }

  /**
   * Elimina un activo permanentemente (hard delete)
   * CU1-3: RF-1-3-7: Eliminar borrador junto con información asociada
   */
  async deletePermanently(id: number): Promise<void> {
    try {
      // Eliminar en orden por foreign keys
      await this.db.query(`DELETE FROM BITACORA_CAMBIOS WHERE activo_id = ?`, [id]);
      await this.db.query(`DELETE FROM ACTIVO_ETIQUETAS WHERE activo_id = ?`, [id]);
      await this.db.query(`DELETE FROM PAPER_METADATOS WHERE activo_id = ?`, [id]);
      await this.db.query(`DELETE FROM DATASET_METADATOS WHERE activo_id = ?`, [id]);
      await this.db.query(`DELETE FROM CODIGO_METADATOS WHERE activo_id = ?`, [id]);
      await this.db.query(`DELETE FROM DOCUMENTO_TECNICO_METADATOS WHERE activo_id = ?`, [id]);
      await this.db.query(`DELETE FROM ACTIVOS WHERE id = ?`, [id]);
    } catch (error) {
      throw new Error(`Error al eliminar permanentemente: ${(error as Error).message}`);
    }
  }

  /**
   * Actualiza metadatos y archivo de un activo
   * CU1-3: RF-1-3-4: Editar metadatos y/o archivo
   */
  async update(id: number, asset: Asset): Promise<void> {

    
    try {
      // Actualizar tabla principal
      await this.db.query(
        `UPDATE ACTIVOS 
         SET titulo = ?, archivo_ruta = ?, confidencialidad = ?, fecha_actualizacion = ?
         WHERE id = ?`,
        [asset.titulo, asset.archivoRuta, asset.confidencialidad, new Date(), id]
      );

      // Actualizar metadatos según tipo
      await this.updateMetadata(id, asset);

      // Actualizar etiquetas
      await this.db.query(`DELETE FROM ACTIVO_ETIQUETAS WHERE activo_id = ?`, [id]);
      await this.insertTags(id, asset);
    } catch (error) {
      throw new Error(`Error al actualizar activo: ${(error as Error).message}`);
    }
  }

  /**
   * Actualiza solo los metadatos específicos según tipo
   */
  private async updateMetadata(activoId: number, asset: Asset): Promise<void> {
    if (asset instanceof Paper) {
      await this.db.query(
        `UPDATE PAPER_METADATOS 
         SET resumen = ?, doi = ?, referencias = ?
         WHERE activo_id = ?`,
        [asset.resumen, asset.doi || null, asset.referencias, activoId]
      );
    } else if (asset instanceof Dataset) {
      await this.db.query(
        `UPDATE DATASET_METADATOS 
         SET previsualizacion = ?, diccionario_ruta = ?, licencia = ?
         WHERE activo_id = ?`,
        [asset.previsualizacion, asset.diccionarioRuta, asset.licencia, activoId]
      );
    } else if (asset instanceof Code) {
      await this.db.query(
        `UPDATE CODIGO_METADATOS 
         SET repositorio = ?, lenguaje = ?, framework = ?, dependencias = ?
         WHERE activo_id = ?`,
        [asset.repositorio, asset.lenguaje, asset.framework, asset.dependencias, activoId]
      );
    } else if (asset instanceof TechnicalDocument) {
      await this.db.query(
        `UPDATE DOCUMENTO_TECNICO_METADATOS 
         SET id_proyecto = ?, cliente = ?
         WHERE activo_id = ?`,
        [asset.idProyecto, asset.cliente || null, activoId]
      );
    }
  }

  /**
   * Busca activos por estado y creador
   * CU1-3: RF-1-3-1: Filtrar por estado del activo
   */
  async findByCreatorAndState(creadorId: number, estado: AssetState): Promise<AssetWithTags[]> {
    try {

      
      const rows = await this.db.query<any[]>(
        `SELECT * FROM ACTIVOS 
         WHERE creador_id = ? AND estado = ?
         ORDER BY fecha_actualizacion DESC`,
        [creadorId, estado]
      );

      const assets: AssetWithTags[] = [];
      for (const row of rows) {
        const asset = await this.mapToAsset(row);
        if (asset) assets.push(asset);
      }

      return assets;
    } catch (error) {
      throw new Error(`Error al buscar activos: ${(error as Error).message}`);
    }
  }

    /**
   * Devuelve todos los activos y sus características
   */
async findAll(): Promise<AssetWithTags[]> {
    try {
      const rows = await this.db.query<any[]>(
        `SELECT * FROM ACTIVOS ORDER BY fecha_actualizacion DESC`
      );
      const assets: AssetWithTags[] = [];
      for (const row of rows) {
        const asset = await this.mapToAsset(row);
        if (asset) assets.push(asset);
      }
      return assets;
    } catch (error) {
      throw new Error(`Error al obtener todos los activos: ${(error as Error).message}`);
    }
  }

  async findByType(tipo: AssetType): Promise<AssetWithTags[]> {
    try {
      const rows = await this.db.query<any[]>(
        `SELECT * FROM ACTIVOS WHERE tipo = ? ORDER BY fecha_actualizacion DESC`,
        [tipo]
      );
      const assets: AssetWithTags[] = [];
      for (const row of rows) {
        const asset = await this.mapToAsset(row);
        if (asset) assets.push(asset);
      }
      return assets;
    } catch (error) {
      throw new Error(`Error al buscar activos por tipo: ${(error as Error).message}`);
    }
  }


  async findArchivoRutaById(activoId: number): Promise<string | null> {
    const rows = await this.db.query<any[]>(
      'SELECT archivo_ruta FROM ACTIVOS WHERE id = ?',
      [activoId]
    );

    return rows.length > 0 ? rows[0].archivo_ruta : null;
  }


  
  private buildIn<T>(values: T[]): { clause: string; params: any[] } {
    if (!values || values.length === 0) {
      // Evitar SQL inválido: si no hay values, devolvemos algo que nunca matchea.
      return { clause: "IN (NULL)", params: [] };
    }
    const placeholders = values.map(() => "?").join(",");
    return { clause: `IN (${placeholders})`, params: values as any[] };
  }

  async findByCreatorFiltered(
    creadorId: number,
    filters: { estados?: AssetState[]; confidencialidades?: Confidentiality[]; limit?: number }
  ): Promise<AssetWithTags[]> {
    const limit = Math.min(Math.max(filters.limit ?? 20, 1), 100);

    const where: string[] = ["creador_id = ?"];
    const params: any[] = [creadorId];

    if (filters.estados && filters.estados.length > 0) {
      const { clause, params: p } = this.buildIn(filters.estados);
      where.push(`estado ${clause}`);
      params.push(...p);
    }

    if (filters.confidencialidades && filters.confidencialidades.length > 0) {
      const { clause, params: p } = this.buildIn(filters.confidencialidades);
      where.push(`confidencialidad ${clause}`);
      params.push(...p);
    }

    const rows = await this.db.query<any[]>(
      `
      SELECT * FROM ACTIVOS
      WHERE ${where.join(" AND ")}
      ORDER BY fecha_actualizacion DESC
      LIMIT ?
      `,
      [...params, limit]
    );

    const assets: AssetWithTags[] = [];
    for (const row of rows) {
      const mapped = await this.mapToAsset(row);
      if (mapped) assets.push(mapped);
    }
    return assets;
  }

  async findByTagFiltered(
    etiquetaId: number,
    filters: { estados?: AssetState[]; confidencialidades?: Confidentiality[]; limit?: number }
  ): Promise<AssetWithTags[]> {
    const limit = Math.min(Math.max(filters.limit ?? 20, 1), 100);

    const where: string[] = ["ae.etiqueta_id = ?"];
    const params: any[] = [etiquetaId];

    if (filters.estados && filters.estados.length > 0) {
      const { clause, params: p } = this.buildIn(filters.estados);
      where.push(`a.estado ${clause}`);
      params.push(...p);
    }

    if (filters.confidencialidades && filters.confidencialidades.length > 0) {
      const { clause, params: p } = this.buildIn(filters.confidencialidades);
      where.push(`a.confidencialidad ${clause}`);
      params.push(...p);
    }

    const rows = await this.db.query<any[]>(
      `
      SELECT DISTINCT a.*
      FROM ACTIVOS a
      INNER JOIN ACTIVO_ETIQUETAS ae ON ae.activo_id = a.id
      WHERE ${where.join(" AND ")}
      ORDER BY a.fecha_actualizacion DESC
      LIMIT ?
      `,
      [...params, limit]
    );

    const assets: AssetWithTags[] = [];
    for (const row of rows) {
      const mapped = await this.mapToAsset(row);
      if (mapped) assets.push(mapped);
    }
    return assets;
  }

  async findByTagIdsFiltered(
    etiquetaIds: number[],
    filters: { estados?: AssetState[]; confidencialidades?: Confidentiality[]; limit?: number }
  ): Promise<AssetWithTags[]> {
    const limit = Math.min(Math.max(filters.limit ?? 20, 1), 100);

    if (!etiquetaIds || etiquetaIds.length === 0) return [];

    const tagIn = this.buildIn(etiquetaIds);

    const where: string[] = [`ae.etiqueta_id ${tagIn.clause}`];
    const params: any[] = [...tagIn.params];

    if (filters.estados && filters.estados.length > 0) {
      const { clause, params: p } = this.buildIn(filters.estados);
      where.push(`a.estado ${clause}`);
      params.push(...p);
    }

    if (filters.confidencialidades && filters.confidencialidades.length > 0) {
      const { clause, params: p } = this.buildIn(filters.confidencialidades);
      where.push(`a.confidencialidad ${clause}`);
      params.push(...p);
    }

    const rows = await this.db.query<any[]>(
      `
      SELECT DISTINCT a.*
      FROM ACTIVOS a
      INNER JOIN ACTIVO_ETIQUETAS ae ON ae.activo_id = a.id
      WHERE ${where.join(" AND ")}
      ORDER BY a.fecha_actualizacion DESC
      LIMIT ?
      `,
      [...params, limit]
    );

    const assets: AssetWithTags[] = [];
    for (const row of rows) {
      const mapped = await this.mapToAsset(row);
      if (mapped) assets.push(mapped);
    }
    return assets;
  }

}
