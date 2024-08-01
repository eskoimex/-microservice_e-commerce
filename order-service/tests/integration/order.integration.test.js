const request = require("supertest");
const app = require("../src/app");

describe("Order Service Integration", () => {
  it("should create, get, and delete an order", async () => {
    const createResponse = await request(app).post("/orders").send({
      productId: 1,
      quantity: 5,
    });

    expect(createResponse.statusCode).toBe(201);

    const orderId = createResponse.body.id;

    const getResponse = await request(app).get(`/orders/${orderId}`);

    expect(getResponse.statusCode).toBe(200);
    expect(getResponse.body).toHaveProperty("quantity", 5);

    const deleteResponse = await request(app).delete(`/orders/${orderId}`);

    expect(deleteResponse.statusCode).toBe(204);
  });
});
