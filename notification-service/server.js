
const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const redis = require("redis");

const app = express();
app.use(bodyParser.json());

const pool = new Pool({
  user: "username",
  host: "localhost",
  database: "notificationdb",
  password: "password",
  port: 5432,
});

const redisClient = redis.createClient();

redisClient.subscribe("notifications");

redisClient.on("message", async (channel, message) => {
  const { userId, content } = JSON.parse(message);
  await pool.query(
    "INSERT INTO notifications (user_id, content) VALUES ($1, $2)",
    [userId, content]
  );
});

app.get("/notifications", async (req, res) => {
  const { userId } = req.query;
  const result = await pool.query(
    "SELECT * FROM notifications WHERE user_id = $1",
    [userId]
  );
  res.json(result.rows);
});

app.listen(3005, () => {
  console.log("Notification service running on port 3005");
});

