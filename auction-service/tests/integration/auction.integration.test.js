const request = require("supertest");
const app = require("../src/app");

describe("Auction Service Integration", () => {
  it("should start an auction and place a bid", async () => {
    const startAuctionResponse = await request(app)
      .post("/auctions")
      .send({
        productId: 1,
        startPrice: 150,
        auctionEndTime: new Date(Date.now() + 60000),
      });

    expect(startAuctionResponse.statusCode).toBe(201);

    const auctionId = startAuctionResponse.body.id;

    const placeBidResponse = await request(app)
      .post(`/auctions/${auctionId}/bids`)
      .send({
        amount: 160,
      });

    expect(placeBidResponse.statusCode).toBe(201);
    expect(placeBidResponse.body).toHaveProperty("amount", 160);
  });
});
