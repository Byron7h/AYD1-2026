function buildOrderService({ orderRepo, paymentGateway }) {
  // Refactor clave: inyeccion de dependencias.
  // Ahora el servicio no crea DB ni gateway internamente.
  // Esto habilita pruebas unitarias reales con mocks/stubs.
  return {
    placeOrder({ userId, items }) {
      // Regla de negocio pura: calcular total.
      const total = items.reduce((sum, item) => sum + item.price, 0);
      if (total <= 0) {
        throw new Error("INVALID_TOTAL");
      }

      // Dependencia externa inyectada: facil de controlar en tests.
      const paymentId = paymentGateway.charge({ userId, total });
      // Persistencia inyectada: tambien verificable por test.
      return orderRepo.save({ userId, items, total, paymentId });
    }
  };
}

module.exports = { buildOrderService };
