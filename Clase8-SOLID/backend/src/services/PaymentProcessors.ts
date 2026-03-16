// src/services/PaymentProcessors.ts

// ============================================================
//  Definiciones base (arquitectura por capas)
// ============================================================
//  Service:
//    Capa de negocio. Orquesta reglas del dominio (validaciones,
//    calculos y flujos) usando uno o mas repositories.
// ============================================================


// ── ❌ ANTES — if/else por cada método de pago en el controller ──
// (Esto estaba dentro de OrderController.processPayment)
// Funciona, pero no hay contrato común entre métodos de pago.
// Agregar uno nuevo = modificar el controller.

export async function processPaymentBefore(
  orderId: number,
  total: number,
  paymentMethod: string,
  data: any
) {
  let result;

  if (paymentMethod === "credit_card") {
    if (!data.cardNumber || data.cardNumber.length !== 16)
      throw new Error("Número de tarjeta inválido");
    result = { success: true, transactionId: `CC-${Date.now()}` };

  } else if (paymentMethod === "paypal") {
    if (!data.paypalEmail)
      throw new Error("Email de PayPal requerido");
    result = { success: true, transactionId: `PP-${Date.now()}` };

  } else {
    throw new Error(`Método de pago no soportado: ${paymentMethod}`);
    // Para agregar "crypto" hay que abrir este archivo
    // y agregar otro else if. El código existente se modifica.
  }

  return result;
}
