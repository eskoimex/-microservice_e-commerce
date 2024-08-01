const request = require("supertest");
const app = require("../src/app");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

describe("Admin Service", () => {
  let server;

  beforeAll(() => {
    server = app.listen(3001);
  });

  afterAll(async () => {
    await server.close();
    await prisma.$disconnect();
  });

  it("should get all users", async () => {
    const response = await request(server)
      .get("/admin/users")
      .set("Authorization", `Bearer <admin-token>`); // Use a valid admin token

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it("should manage products", async () => {
    const response = await request(server)
      .post("/admin/products")
      .send({
        name: "Admin Product",
        price: 100,
      })
      .set("Authorization", `Bearer <admin-token>`);

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("id");
  });
});
