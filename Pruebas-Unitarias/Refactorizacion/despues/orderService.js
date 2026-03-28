function buildOrderService({ orderRepo, paymentGateway }) {
  return {
    placeOrder({ userId, items }) {
      const total = items.reduce((sum, item) => sum + item.price, 0);
      if (total <= 0) {
        throw new Error("INVALID_TOTAL");
      }

      const paymentId = paymentGateway.charge({ userId, total });
      return orderRepo.save({ userId, items, total, paymentId });
    }
  };
}

module.exports = { buildOrderService };
