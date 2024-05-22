require("dotenv").config();
const express = require("express");
const app = express();
const fs = require("fs");
const path = require("path");
const { v1: uuid } = require("uuid");
const server = require("http").createServer(app);
const pdf = require("pdf-parse");

const io = require("socket.io")(server, {
  cors: { origin: "*" },
});

// Enable parsing of URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// app.post("/uploadPDF", fileploadsingle('pdf'), (req, res) => {

// });

const rooms = {};

io.on("connection", (socket) => {
  console.log("a user connected ID:" + socket.id);
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  socket.on("JoinRoom", ({ room }) => {
    if (!rooms[room] || !rooms[room].includes(socket.id)) {
      socket.join(room);
      rooms[room] = rooms[room] || []; // Initialize room if it doesn't exist
      rooms[room].push(socket.id);
      console.log(rooms);
    } else {
      console.log(`${socket.id} is already in room ${room}`);
    }
  });

  socket.on("SendAudioChunk", (data) => {
    console.log("sent");
    console.log("====================================");
    console.log(SendAudioChunk);
    console.log("====================================");
    // io.emit("start-recording");
  });

  socket.on("send_pdf", async ({ fileName, fileContent, roomName }) => {
    console.log("recieved data");
    console.log(fileName);
    // console.log(fileContent);

    try {
      // Decode the base64 encoded content into a buffer
      const pdfBuffer = Buffer.from(fileContent, "base64");

      pdf(pdfBuffer).then(function (data) {
        // console.log(data.text);
        socket.to(roomName).emit("send_pdf_text", {data: data.text});
      });
    } catch (error) {
      console.error("Error processing PDF:", error);
      // Handle errors appropriately (e.g., send error response to sender)
    }
  });

  socket.on("audio", ({ audioData }) => {
    console.log("Starting recording");
    console.log(audioData);
    socket.to(roomName).emit("message", {message});
  });

  socket.on("stop-recording", () => {
    console.log("Stopping recording");
    io.emit("stop-recording");
  });
});

app.get("/", (req, res) => {
  res.json({ data: "It works!" });
});

server.listen(4000, () => console.log("Server is running on port 4000"));
