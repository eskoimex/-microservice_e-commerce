const request = require("supertest");
const app = require("../src/app");

describe("Admin Service Integration", () => {
  it("should successfully manage users and products", async () => {
    const adminToken = "<valid-admin-token>"; // Retrieve or mock this token

    const createProductResponse = await request(app)
      .post("/admin/products")
      .send({
        name: "Integration Admin Product",
        price: 200,
      })
      .set("Authorization", `Bearer ${adminToken}`);

    expect(createProductResponse.statusCode).toBe(201);

    const getUsersResponse = await request(app)
      .get("/admin/users")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(getUsersResponse.statusCode).toBe(200);
    expect(Array.isArray(getUsersResponse.body)).toBe(true);
  });
});
