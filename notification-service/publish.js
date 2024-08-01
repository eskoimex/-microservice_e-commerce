const redis = require("redis");
const redisClient = redis.createClient();

const publishNotification = (userId, content) => {
  const notification = { userId, content };
  redisClient.publish("notifications", JSON.stringify(notification));
};

// Example usage in an endpoint
app.post("/some-endpoint", (req, res) => {
  const { userId, someData } = req.body;
  // Perform some operations...

  // Publish notification
  publishNotification(userId, "Your action was successful!");

  res.json({ message: "Action completed" });
});
