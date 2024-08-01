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
  database: "productdb",
  password: "password",
  port: 5432,
});

const redisClient = redis.createClient();

// Swagger configuration
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Product Service API",
      version: "1.0.0",
      description: "API documentation for the Product Service",
    },
    servers: [
      {
        url: "http://localhost:3002",
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
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - price
 *         - auctionTime
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the product
 *         name:
 *           type: string
 *           description: The name of the product
 *         description:
 *           type: string
 *           description: The description of the product
 *         price:
 *           type: number
 *           description: The price of the product
 *         auctionTime:
 *           type: string
 *           format: date-time
 *           description: The auction start time
 *       example:
 *         id: 1
 *         name: "Sample Product"
 *         description: "This is a sample product"
 *         price: 199.99
 *         auctionTime: "2024-08-01T10:00:00Z"
 */

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management
 */

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               auctionTime:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: The created product
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 */
app.post("/products", authenticateAdmin, async (req, res) => {
  const { name, description, price, auctionTime } = req.body;
  const result = await pool.query(
    "INSERT INTO products (name, description, price, auction_time) VALUES ($1, $2, $3, $4) RETURNING *",
    [name, description, price, auctionTime]
  );
  res.json(result.rows[0]);
});

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
app.get("/products", async (req, res) => {
  const result = await pool.query("SELECT * FROM products");
  res.json(result.rows);
});

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get a product by id
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The id of the product
 *     responses:
 *       200:
 *         description: The product details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 */
app.get("/products/:id", async (req, res) => {
  const { id } = req.params;
  const result = await pool.query("SELECT * FROM products WHERE id = $1", [id]);
  res.json(result.rows[0]);
});

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Update a product by id
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The id of the product
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               auctionTime:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: The updated product
 */
app.put("/products/:id", authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, description, price, auctionTime } = req.body;
  await pool.query(
    "UPDATE products SET name = $1, description = $2, price = $3, auction_time = $4 WHERE id = $5",
    [name, description, price, auctionTime, id]
  );
  res.sendStatus(200);
});

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete a product by id
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The id of the product
 *     responses:
 *       204:
 *         description: No content
 */
app.delete("/products/:id", authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  await pool.query("DELETE FROM products WHERE id = $1", [id]);
  res.sendStatus(204);
});

function authenticateAdmin(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, "secretkey", (err, user) => {
    if (err || user.role !== "admin") return res.sendStatus(403);
    req.user = user;
    next();
  });
}

app.listen(3002, () => {
  console.log("Product service running on port 3002");
});
