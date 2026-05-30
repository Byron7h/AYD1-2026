// src/models/Asset.ts
// Modelo (capa de dominio) usado por el componente assets.

import { AssetType } from '../types/AssetType';
import { Confidentiality, AssetState } from '../types/AssetState';

/**
 * Modelo base abstracto para todos los activos
 * Representa la tabla ACTIVOS en la base de datos
 */
export abstract class Asset {
  id?: number;
  creadorId: number;
  tipo: AssetType;
  titulo: string;
  estado: AssetState;
  confidencialidad: Confidentiality;
  archivoRuta: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;

  constructor(
    creadorId: number,
    tipo: AssetType,
    titulo: string,
    archivoRuta: string,
    confidencialidad: Confidentiality = Confidentiality.PUBLICO
  ) {
    this.creadorId = creadorId;
    this.tipo = tipo;
    this.titulo = titulo;
    this.archivoRuta = archivoRuta;
    this.confidencialidad = confidencialidad;
    this.estado = AssetState.BORRADOR;
    this.fechaCreacion = new Date();
    this.fechaActualizacion = new Date();
  }

  /**
   * Método abstracto para obtener metadatos específicos
   */
  abstract getMetadata(): any;
}

/**
 * Modelo para Paper (artículos científicos)
 * Tabla: PAPER_METADATOS
 * DR-2: Solo formato PDF
 */
export class Paper extends Asset {
  resumen: string;
  doi?: string;
  referencias: string;
  etiquetasIds: number[];
  //etiquetasIdsNombre?: string[];
  constructor(
    creadorId: number,
    titulo: string,
    archivoRuta: string,
    resumen: string,
    referencias: string,
    etiquetasIds: number[] = [],
    doi?: string,
    //etiquetasIdsNombre: string[] = []
  ) {
    super(creadorId, AssetType.PAPER, titulo, archivoRuta);
    this.resumen = resumen;
    this.doi = doi;
    this.referencias = referencias;
    this.etiquetasIds = etiquetasIds;
    //this.etiquetasIdsNombre = etiquetasIdsNombre;
  }

  getMetadata() {
    return {
      resumen: this.resumen,
      doi: this.doi,
      referencias: this.referencias,
      etiquetasIds: this.etiquetasIds,
      //etiquetasIdsNombre: this.etiquetasIdsNombre
    };
  }
}

/**
 * Modelo para Dataset (conjuntos de datos)
 * Tabla: DATASET_METADATOS
 * DR-3: Solo CSV o JSON
 */
export class Dataset extends Asset {
  previsualizacion: string; // JSON de primeras 5 filas
  diccionarioRuta: string;
  licencia: string;
  etiquetasIds: number[];
  //etiquetasIdsNombre: string[];
  constructor(
    creadorId: number,
    titulo: string,
    archivoRuta: string,
    previsualizacion: string,
    diccionarioRuta: string,
    licencia: string,
    etiquetasIds: number[] = [],
    etiquetasIdsNombre: string[] = []
  ) {
    super(creadorId, AssetType.DATASET, titulo, archivoRuta);
    this.previsualizacion = previsualizacion;
    this.diccionarioRuta = diccionarioRuta;
    this.licencia = licencia;
    this.etiquetasIds = etiquetasIds;
    //this.etiquetasIdsNombre = etiquetasIdsNombre;
  }

  getMetadata() {
    return {
      previsualizacion: this.previsualizacion,
      diccionarioRuta: this.diccionarioRuta,
      licencia: this.licencia,
      etiquetasIds: this.etiquetasIds,
      //etiquetasIdsNombre: this.etiquetasIdsNombre
    };
  }
}

/**
 * Modelo para Código Fuente
 * Tabla: CODIGO_METADATOS
 * DR-6: URL Git o archivo ZIP
 */
export class Code extends Asset {
  repositorio: string;
  lenguaje: string;
  framework: string;
  dependencias: string; // JSON string
  etiquetasIds: number[];
  etiquetasIdsNombre?: string[];
  constructor(
    creadorId: number,
    titulo: string,
    archivoRuta: string,
    repositorio: string,
    lenguaje: string,
    framework: string,
    dependencias: string,
    etiquetasIds: number[] = [],
    //etiquetasIdsNombre: string[] = []
  ) {
    super(creadorId, AssetType.CODIGO, titulo, archivoRuta);
    this.repositorio = repositorio;
    this.lenguaje = lenguaje;
    this.framework = framework;
    this.dependencias = dependencias;
    this.etiquetasIds = etiquetasIds;
    //this.etiquetasIdsNombre = etiquetasIdsNombre;
  }

  getMetadata() {
    return {
      repositorio: this.repositorio,
      lenguaje: this.lenguaje,
      framework: this.framework,
      dependencias: this.dependencias,
      etiquetasIds: this.etiquetasIds,
      //etiquetasIdsNombre: this.etiquetasIdsNombre
    };
  }
}

/**
 * Modelo para Documento Técnico
 * Tabla: DOCUMENTO_TECNICO_METADATOS
 * DR-5: Solo PDF o DOCX
 * RF-1-2-3: Confidencialidad obligatoria
 */
export class TechnicalDocument extends Asset {
  idProyecto: string;
  cliente?: string;
  etiquetasIds: number[];
  etiquetasIdsNombre?: string[];
  constructor(
    creadorId: number,
    titulo: string,
    archivoRuta: string,
    confidencialidad: Confidentiality,
    idProyecto: string,
    etiquetasIds: number[] = [],
    cliente?: string,
    //etiquetasIdsNombre: string[] = []
  ) {
    super(creadorId, AssetType.DOCUMENTO_TECNICO, titulo, archivoRuta, confidencialidad);
    this.idProyecto = idProyecto;
    this.cliente = cliente;
    this.etiquetasIds = etiquetasIds;
    //this.etiquetasIdsNombre = etiquetasIdsNombre;
  }

  getMetadata() {
    return {
      idProyecto: this.idProyecto,
      cliente: this.cliente,
      etiquetasIds: this.etiquetasIds,
      //etiquetasIdsNombre: this.etiquetasIdsNombre
    };
  }
}
