const { buildOrderService } = require("./orderService");

describe("OrderService refactor example", () => {
  test("places order when total is valid", () => {
    const orderRepo = { save: jest.fn().mockReturnValue({ id: 1 }) };
    const paymentGateway = { charge: jest.fn().mockReturnValue("pay-001") };

    const service = buildOrderService({ orderRepo, paymentGateway });

    const result = service.placeOrder({
      userId: 7,
      items: [{ price: 10 }, { price: 5 }]
    });

    expect(result).toEqual({ id: 1 });
    expect(paymentGateway.charge).toHaveBeenCalledWith({ userId: 7, total: 15 });
    expect(orderRepo.save).toHaveBeenCalledWith({
      userId: 7,
      items: [{ price: 10 }, { price: 5 }],
      total: 15,
      paymentId: "pay-001"
    });
  });
});
