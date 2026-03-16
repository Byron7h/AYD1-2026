// src/repositories/OrderRepository.ts

// ============================================================
//  Definiciones base (arquitectura por capas)
// ============================================================
//  Repository:
//    Capa de acceso a datos. Encapsula consultas/persistencia en BD
//    para que el resto del sistema no dependa de Prisma o SQL directo.
// ============================================================

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ── ❌ ANTES — getOrders con if/else por cada filtro ──────────
// Funciona, pero cada filtro nuevo obliga a modificar
// el código existente que ya funcionaba.

export async function getOrdersBefore(status?: string, email?: string) {
  if (status && email) {
    return prisma.order.findMany({
      where: { status: status as any, customerEmail: email },
      include: { items: { include: { product: true } } },
    });
  } else if (status) {
    return prisma.order.findMany({
      where: { status: status as any },
      include: { items: { include: { product: true } } },
    });
  } else if (email) {
    return prisma.order.findMany({
      where: { customerEmail: email },
      include: { items: { include: { product: true } } },
    });
  } else {
    return prisma.order.findMany({
      include: { items: { include: { product: true } } },
    });
  }
  // Si necesitamos filtrar por fecha, agregamos otro else if aquí.
  // Si necesitamos filtrar por monto mínimo, otro else if.
  // El bloque crece sin control y tocamos código que ya funciona.
}

export async function createOrderBefore(
  customerEmail: string,
  total: number,
  items: { productId: number; quantity: number; unitPrice: number }[]
) {
  return prisma.order.create({
    data: { customerEmail, total, status: "PENDING", items: { create: items } },
    include: { items: { include: { product: true } } },
  });
}
