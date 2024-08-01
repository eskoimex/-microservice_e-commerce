const io = require("socket.io")(3001, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("bid", (bid) => {
    console.log("new bid", bid);
    io.emit("new-bid", bid);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

console.log("Auction service running on port 3001");
