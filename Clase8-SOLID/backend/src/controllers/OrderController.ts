// src/controllers/OrderController.ts

// ============================================================
//  Definiciones base (arquitectura por capas)
// ============================================================
//  Controller:
//    Capa de entrada HTTP. Recibe requests, valida datos basicos,
//    delega la logica de negocio al Service y construye responses.
// ============================================================


import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

// ── ❌ ANTES — createOrder hace TODO ─────────────────────────
// Funciona, pero viola SRP: valida, accede a BD, calcula y notifica
// en un solo método. Cualquier cambio en cualquiera de esas
// responsabilidades obliga a modificar este archivo.

export class OrderControllerBefore {

  async createOrder(req: Request, res: Response) {
    const { customerEmail, items } = req.body;

    // Responsabilidad 1: Validar
    if (!customerEmail || !items || items.length === 0) {
      return res.status(400).json({ error: "Datos incompletos" });
    }
    if (!customerEmail.includes("@")) {
      return res.status(400).json({ error: "Email inválido" });
    }

    // Responsabilidad 2: Consultar BD y calcular total
    let total = 0;
    const orderItems = [];
    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) return res.status(404).json({ error: `Producto ${item.productId} no encontrado` });
      if (product.stock < item.quantity) return res.status(400).json({ error: `Stock insuficiente para ${product.name}` });
      total += product.price * item.quantity;
      orderItems.push({ productId: item.productId, quantity: item.quantity, unitPrice: product.price });
    }

    // Responsabilidad 3: Guardar en BD
    const order = await prisma.order.create({
      data: { customerEmail, total, status: "PENDING", items: { create: orderItems } },
      include: { items: { include: { product: true } } },
    });

    // Responsabilidad 4: Enviar email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT),
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    await transporter.sendMail({
      from: process.env.SMTP_USER, to: customerEmail,
      subject: `Orden #${order.id} confirmada`, text: `Tu orden por $${total} fue recibida.`,
    });

    return res.status(201).json(order);
  }

  async getOrders(req: Request, res: Response) {
    const orders = await prisma.order.findMany({
      include: { items: { include: { product: true } } },
    });
    return res.json(orders);
  }
}