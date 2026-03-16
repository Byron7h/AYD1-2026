// src/interfaces/index.ts

// ============================================================
//  Definicion base: que es una interfaz
// ============================================================
//  Una interfaz en TypeScript es un contrato.
//  Define QUE metodos/propiedades debe tener una clase u objeto,
//  pero no define COMO se implementan.
//
//  Beneficios clave en esta arquitectura:
//    - Desacopla capas: el controller/service depende del contrato,
//      no de Prisma ni de una clase concreta.
//    - Permite reemplazar implementaciones sin romper consumidores
//      (por ejemplo, cambiar de Prisma a otra fuente de datos).
//    - Mejora pruebas: se pueden usar mocks/fakes que cumplan la
//      interfaz para testear logica de negocio facilmente.
// ============================================================

import { Order, OrderItem, Product } from "@prisma/client";

export type OrderWithItems = Order & {
  items: (OrderItem & { product: Product })[];
};

export type CreateOrderDTO = {
  customerEmail: string;
  items: { productId: number; quantity: number }[];
};

export type OrderFilters = {
  status?: string;
  customerEmail?: string;
};

// ── ❌ ANTES — una interfaz gigante obliga a implementar todo ──
// Funciona si todos los que la implementan necesitan todo,
// pero obliga a clases de solo-lectura a tener métodos de escritura.

export interface IOrderRepositoryBefore {
  findAll(filters?: OrderFilters): Promise<OrderWithItems[]>;
  findById(id: number): Promise<Order | null>;
  create(data: CreateOrderDTO, total: number, items: any[]): Promise<OrderWithItems>;
  updateStatus(id: number, status: string): Promise<Order>;

  // Una clase de reportes que implemente esta interfaz
  // está obligada a implementar create() y updateStatus()
  // aunque jamás los use. Si alguien los llama por error,
  // el programa falla. No hay forma de saberlo en compilación.
}
