const request = require("supertest");
const app = require("../src/app");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

describe("Auction Service", () => {
  let server;

  beforeAll(() => {
    server = app.listen(3004);
  });

  afterAll(async () => {
    await server.close();
    await prisma.$disconnect();
  });

  it("should start an auction", async () => {
    const response = await request(server)
      .post("/auctions")
      .send({
        productId: 1,
        startPrice: 100,
        auctionEndTime: new Date(Date.now() + 60000), // 1 minute from now
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("id");
  });

  it("should place a bid", async () => {
    const auctionResponse = await request(server)
      .post("/auctions")
      .send({
        productId: 1,
        startPrice: 100,
        auctionEndTime: new Date(Date.now() + 60000),
      });

    const auctionId = auctionResponse.body.id;

    const response = await request(server)
      .post(`/auctions/${auctionId}/bids`)
      .send({
        amount: 120,
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("id");
  });
});
