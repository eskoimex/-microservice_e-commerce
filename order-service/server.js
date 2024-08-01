const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");
const redis = require("redis");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const app = express();
app.use(bodyParser.json());

const pool = new Pool({
  user: "username",
  host: "localhost",
  database: "orderdb",
  password: "password",
  port: 5432,
});

const redisClient = redis.createClient();

// Swagger configuration
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Order Service API",
      version: "1.0.0",
      description: "API documentation for the Order Service",
    },
    servers: [
      {
        url: "http://localhost:3003",
      },
    ],
  },
  apis: ["./server.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Order:
 *       type: object
 *       required:
 *         - userId
 *         - productId
 *         - bidAmount
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the order
 *         userId:
 *           type: integer
 *           description: The id of the user
 *         productId:
 *           type: integer
 *           description: The id of the product
 *         bidAmount:
 *           type: number
 *           description: The bid amount
 *       example:
 *         id: 1
 *         userId: 1
 *         productId: 1
 *         bidAmount: 100
 */

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management
 */

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: integer
 *               bidAmount:
 *                 type: number
 *     responses:
 *       200:
 *         description: The created order
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 */
app.post("/orders", authenticateToken, async (req, res) => {
  const { productId, bidAmount } = req.body;
  const { userId } = req.user;
  const result = await pool.query(
    "INSERT INTO orders (user_id, product_id, bid_amount) VALUES ($1, $2, $3) RETURNING *",
    [userId, productId, bidAmount]
  );
  res.json(result.rows[0]);
});

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get all orders for the authenticated user
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 */
app.get("/orders", authenticateToken, async (req, res) => {
  const { userId } = req.user;
  const result = await pool.query("SELECT * FROM orders WHERE user_id = $1", [
    userId,
  ]);
  res.json(result.rows);
});

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get an order by id
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The id of the order
 *     responses:
 *       200:
 *         description: The order details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 */
app.get("/orders/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const result = await pool.query("SELECT * FROM orders WHERE id = $1", [id]);
  res.json(result.rows[0]);
});

/**
 * @swagger
 * /orders/{id}:
 *   put:
 *     summary: Update an order by id
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The id of the order
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bidAmount:
 *                 type: number
 *     responses:
 *       200:
 *         description: The updated order
 */
app.put("/orders/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { bidAmount } = req.body;
  await pool.query("UPDATE orders SET bid_amount = $1 WHERE id = $2", [
    bidAmount,
    id,
  ]);
  res.sendStatus(200);
});

/**
 * @swagger
 * /orders/{id}:
 *   delete:
 *     summary: Delete an order by id
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The id of the order
 *     responses:
 *       204:
 *         description: No content
 */
app.delete("/orders/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  await pool.query("DELETE FROM orders WHERE id = $1", [id]);
  res.sendStatus(204);
});

function authenticateToken(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, "secretkey", (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

app.listen(3003, () => {
  console.log("Order service running on port 3003");
});
