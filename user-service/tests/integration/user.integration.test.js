const request = require("supertest");
const app = require("../src/app"); // Your Express app

describe("User Service Integration", () => {
  it("should successfully perform end-to-end registration and login", async () => {
    const registerResponse = await request(app).post("/users/register").send({
      username: "integrationuser",
      password: "integrationpassword",
    });

    expect(registerResponse.statusCode).toBe(201);

    const loginResponse = await request(app).post("/users/login").send({
      username: "integrationuser",
      password: "integrationpassword",
    });

    expect(loginResponse.statusCode).toBe(200);
    expect(loginResponse.body).toHaveProperty("token");
  });
});
