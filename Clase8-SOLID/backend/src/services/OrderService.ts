// src/services/OrderService.ts
// ============================================================
//  S — Single Responsibility Principle
//  Responsabilidad única: orquestar la lógica de negocio de órdenes.
//  No sabe de HTTP, no envía emails directamente, no valida inputs.
// ============================================================

import { PrismaClient } from "@prisma/client";
import { OrderValidator } from "../validators/OrderValidator";
import { NotificationService } from "./NotificationService";
import { CreateOrderDTO, OrderFilters } from "../interfaces";

const prisma = new PrismaClient();

export class OrderService {
  constructor(
    private validator: OrderValidator,
    private notifier: NotificationService
  ) {}

  async createOrder(data: CreateOrderDTO) {
    // Delega validación — OrderService no conoce las reglas, solo llama al validador
    this.validator.validate(data.customerEmail, data.items);

    // Responsabilidad de negocio: verificar stock y calcular total
    let total = 0;
    const orderItems = [];
    for (const item of data.items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) throw new Error(`Producto ${item.productId} no encontrado`);
      if (product.stock < item.quantity) throw new Error(`Stock insuficiente para ${product.name}`);
      total += product.price * item.quantity;
      orderItems.push({ productId: item.productId, quantity: item.quantity, unitPrice: product.price });
    }

    // Persistir la orden
    const order = await prisma.order.create({
      data: { customerEmail: data.customerEmail, total, status: "PENDING", items: { create: orderItems } },
      include: { items: { include: { product: true } } },
    });

    // Delega notificación — OrderService no sabe cómo se envían emails
    await this.notifier.notifyOrderCreated(data.customerEmail, order.id, total);
    return order;
  }

  async getOrders(filters?: OrderFilters) {
    return prisma.order.findMany({
      where: {
        ...(filters?.status        && { status:        filters.status as any }),
        ...(filters?.customerEmail && { customerEmail: filters.customerEmail }),
      },
      include: { items: { include: { product: true } } },
    });
  }
}
