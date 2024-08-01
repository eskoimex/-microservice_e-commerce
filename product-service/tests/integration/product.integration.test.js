const request = require("supertest");
const app = require("../src/app");

describe("Product Service Integration", () => {
  it("should create, update, and delete a product", async () => {
    const createResponse = await request(app).post("/products").send({
      name: "Integration Product",
      price: 150,
    });

    expect(createResponse.statusCode).toBe(201);

    const productId = createResponse.body.id;

    const updateResponse = await request(app)
      .put(`/products/${productId}`)
      .send({
        price: 200,
      });

    expect(updateResponse.statusCode).toBe(200);
    expect(updateResponse.body).toHaveProperty("price", 200);

    const deleteResponse = await request(app).delete(`/products/${productId}`);

    expect(deleteResponse.statusCode).toBe(204);
  });
});
