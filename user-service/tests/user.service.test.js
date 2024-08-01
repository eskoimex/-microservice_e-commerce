const request = require("supertest");
const app = require("../src/app"); // Your Express app
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

describe("User Service", () => {
  let server;

  beforeAll(() => {
    server = app.listen(3000); // Start the server
  });

  afterAll(async () => {
    await server.close(); // Close the server
    await prisma.$disconnect(); // Disconnect Prisma
  });

  it("should register a new user", async () => {
    const response = await request(server).post("/users/register").send({
      username: "testuser",
      password: "testpassword",
    });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("id");
  });

  it("should login a user", async () => {
    const response = await request(server).post("/users/login").send({
      username: "testuser",
      password: "testpassword",
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("token");
  });

  it("should get user profile", async () => {
    const loginResponse = await request(server).post("/users/login").send({
      username: "testuser",
      password: "testpassword",
    });

    const token = loginResponse.body.token;

    const response = await request(server)
      .get("/users/profile")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("username");
  });

  it("should update user profile", async () => {
    const loginResponse = await request(server).post("/users/login").send({
      username: "testuser",
      password: "testpassword",
    });

    const token = loginResponse.body.token;

    const response = await request(server)
      .put("/users/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({
        username: "updateduser",
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("username", "updateduser");
  });
});
