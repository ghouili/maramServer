require("dotenv").config();
const express = require("express");
const app = express();
const fs = require("fs");
const path = require("path");
const { v1: uuid } = require("uuid");
const server = require("http").createServer(app);
const pdf = require("pdf-parse");
const base64Arraybuffer = require("base64-arraybuffer");
const { AssemblyAI } = require("assemblyai");

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY,
});
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

  socket.on("send_pdf", async ({ fileContent, roomName }) => {
    console.log("recieved data");
    // console.log(fileName);
    // console.log(fileContent);

    try {
      // Decode the base64 encoded content into a buffer
      const pdfBuffer = Buffer.from(fileContent, "base64");

      console.log(pdfBuffer);
      pdf(pdfBuffer).then(function (data) {
        console.log(data.text);
        socket.to(roomName).emit("send_pdf_text", { data: data.text });
      });
    } catch (error) {
      console.error("Error processing PDF:", error);
      // Handle errors appropriately (e.g., send error response to sender)
    }
  });

  socket.on("audio", async ({ data, roomName }) => {
    console.log("Starting recording");
    const audioArrayBuffer = base64Arraybuffer.decode(data);
    // console.log(audioArrayBuffer);
    // Save the decoded audio data to a file
    let audioUrl = `./src/uploads/${uuid()}.mp3`;
    // let audioUrl = `./src/uploads/audio.mp3`;
    fs.writeFileSync(audioUrl, Buffer.from(audioArrayBuffer));

    console.log("transcript");
    const params = {
      audio: audioUrl,
      language_detection: true,
    };

    const transcript = await client.transcripts.transcribe(params);
    console.log(transcript.text);
    socket.to(roomName).emit("recieve_text", { data: transcript.text });
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
