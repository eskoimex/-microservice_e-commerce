const request = require("supertest");
const app = require("../src/app");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

describe("Product Service", () => {
  let server;

  beforeAll(() => {
    server = app.listen(3002);
  });

  afterAll(async () => {
    await server.close();
    await prisma.$disconnect();
  });

  it("should create a new product", async () => {
    const response = await request(server).post("/products").send({
      name: "New Product",
      price: 50,
    });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("id");
  });

  it("should update a product", async () => {
    const newProduct = await request(server).post("/products").send({
      name: "Update Product",
      price: 75,
    });

    const productId = newProduct.body.id;

    const response = await request(server).put(`/products/${productId}`).send({
      price: 80,
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("price", 80);
  });

  it("should delete a product", async () => {
    const newProduct = await request(server).post("/products").send({
      name: "Delete Product",
      price: 90,
    });

    const productId = newProduct.body.id;

    const response = await request(server).delete(`/products/${productId}`);

    expect(response.statusCode).toBe(204);
  });
});
