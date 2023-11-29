const express = require("express");
const http = require("http");
const https = require("https");
const fs = require("fs");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

let server;
const keyPath = "path/to/your/key.pem"; // Replace with path to your key
const certPath = "path/to/your/cert.pem"; // Replace with path to your certificate

// Check if SSL certificate files exist
if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
  const options = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
  };
  server = https.createServer(options, app); // Create HTTPS server if SSL files exist
  console.log("HTTPS Server started.");
} else {
  server = http.createServer(app); // Fallback to HTTP server if SSL files don't exist
  console.log("HTTP Server started.");
}

const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000", // Update if your client is served over HTTPS
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("message", (message) => {
    io.emit("message", message);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });

  socket.on("error", (error) => {
    console.error("Socket Error:", error);
  });
});

server.listen(4000, () => {
  console.log("Listening on port 4000");
});
