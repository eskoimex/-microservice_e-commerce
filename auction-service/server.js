const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const { Pool } = require("pg");
const redis = require("redis");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const pool = new Pool({
  user: "username",
  host: "localhost",
  database: "auctiondb",
  password: "password",
  port: 5432,
});

const redisClient = redis.createClient();

// Swagger configuration
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Auction Service API",
      version: "1.0.0",
      description: "API documentation for the Auction Service",
    },
    servers: [
      {
        url: "http://localhost:3004",
      },
    ],
  },
  apis: ["./server.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

io.on("connection", (socket) => {
  console.log("New client connected");

  /**
   * @swagger
   * tags:
   *   name: Auction
   *   description: Auction management
   */

  /**
   * @swagger
   * /joinAuction:
   *   post:
   *     summary: Join an auction
   *     tags: [Auction]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               auctionId:
   *                 type: integer
   *     responses:
   *       200:
   *         description: Joined auction successfully
   */
  socket.on("joinAuction", async (auctionId) => {
    socket.join(auctionId);
    const result = await pool.query("SELECT * FROM products WHERE id = $1", [
      auctionId,
    ]);
    io.to(auctionId).emit("auctionDetails", result.rows[0]);
  });

  /**
   * @swagger
   * /bid:
   *   post:
   *     summary: Place a bid
   *     tags: [Auction]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               auctionId:
   *                 type: integer
   *               bidAmount:
   *                 type: number
   *     responses:
   *       200:
   *         description: Bid placed successfully
   */
  socket.on("bid", async (auctionId, bidAmount) => {
    await pool.query(
      "INSERT INTO bids (auction_id, bid_amount) VALUES ($1, $2)",
      [auctionId, bidAmount]
    );
    io.to(auctionId).emit("newBid", bidAmount);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

server.listen(3004, () => {
  console.log("Auction service running on port 3004");
});
