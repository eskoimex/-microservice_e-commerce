const request = require("supertest");
const app = require("../src/app");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

describe("Order Service", () => {
  let server;

  beforeAll(() => {
    server = app.listen(3003);
  });

  afterAll(async () => {
    await server.close();
    await prisma.$disconnect();
  });

  it("should create a new order", async () => {
    const response = await request(server).post("/orders").send({
      productId: 1,
      quantity: 2,
    });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("id");
  });

  it("should get an order by ID", async () => {
    const newOrder = await request(server).post("/orders").send({
      productId: 1,
      quantity: 3,
    });

    const orderId = newOrder.body.id;

    const response = await request(server).get(`/orders/${orderId}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("quantity", 3);
  });

  it("should delete an order", async () => {
    const newOrder = await request(server).post("/orders").send({
      productId: 1,
      quantity: 4,
    });

    const orderId = newOrder.body.id;

    const response = await request(server).delete(`/orders/${orderId}`);

    expect(response.statusCode).toBe(204);
  });
});
