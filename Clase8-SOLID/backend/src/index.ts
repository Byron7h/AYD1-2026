// src/index.ts

import "dotenv/config";
import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json());

// ── ❌ ANTES — las dependencias se crean dentro de los servicios ──
// Funciona, pero OrderService está acoplado a Prisma y nodemailer.
// No se puede testear ni cambiar de BD sin modificar OrderService.

class NotificationServiceBefore {
  async notify(email: string, orderId: number, total: number) {
    // nodemailer creado aquí adentro — acoplado directamente
    console.log(`[Email directo] → ${email} | Orden #${orderId} | $${total}`);
  }
}

class OrderServiceBefore {
  // Las dependencias se crean aquí adentro — no se pueden sustituir
  private notifier = new NotificationServiceBefore();

  async createOrder(customerEmail: string, total: number, items: any[]) {
    const order = await prisma.order.create({
      data: { customerEmail, total, status: "PENDING", items: { create: items } },
      include: { items: { include: { product: true } } },
    });
    // Acoplado a NotificationServiceBefore — no se puede cambiar
    await this.notifier.notify(customerEmail, order.id, total);
    return order;
  }

  async getOrders() {
    return prisma.order.findMany({
      include: { items: { include: { product: true } } },
    });
  }
}

class ProductServiceBefore {
  async getProducts() {
    return prisma.product.findMany();
  }
  async createProduct(name: string, price: number, stock: number) {
    return prisma.product.create({ data: { name, price, stock } });
  }
}

const orderService   = new OrderServiceBefore();
const productService = new ProductServiceBefore();

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.get("/products",  async (_req, res) => res.json(await productService.getProducts()));
app.post("/products", async (req, res) => {
  const { name, price, stock } = req.body;
  res.status(201).json(await productService.createProduct(name, price, stock));
});

app.get("/orders",  async (_req, res) => res.json(await orderService.getOrders()));
app.post("/orders", async (req, res) => {
  const { customerEmail, items } = req.body;
  let total = 0;
  const orderItems = [];
  for (const item of items) {
    const product = await prisma.product.findUnique({ where: { id: item.productId } });
    if (!product) { res.status(404).json({ error: "Producto no encontrado" }); return; }
    total += product.price * item.quantity;
    orderItems.push({ productId: item.productId, quantity: item.quantity, unitPrice: product.price });
  }
  res.status(201).json(await orderService.createOrder(customerEmail, total, orderItems));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
