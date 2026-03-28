class OrderService {
  placeOrder({ userId, items }) {
    // Hard-coded dependencies: not replaceable in tests.
    const db = new Database();
    const paymentGateway = new PaymentGateway();

    const total = items.reduce((sum, item) => sum + item.price, 0);
    if (total <= 0) {
      throw new Error("INVALID_TOTAL");
    }

    const paymentId = paymentGateway.charge({ userId, total });
    return db.saveOrder({ userId, items, total, paymentId });
  }
}

class Database {
  saveOrder(order) {
    return { id: 1, ...order };
  }
}

class PaymentGateway {
  charge({ total }) {
    if (total > 1000) {
      throw new Error("PAYMENT_REJECTED");
    }
    return "pay-001";
  }
}

module.exports = { OrderService };
