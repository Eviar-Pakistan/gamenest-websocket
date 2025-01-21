// app.js
const WebSocket = require("ws");
const express = require("express");

// Create an Express application
const app = express();

// Create an HTTP server to host your Express app (optional for static files)
const server = require("http").createServer(app);

// Create a WebSocket server attached to the HTTP server
const wss = new WebSocket.Server({ server });
let gameData = {};
let unitData = []; // List to store headset information

// Function to find or update headset data
function updateUnitData(serialNo, batteryLevel) {
  // Check if the headset with the given serial number already exists
  const existingUnit = unitData.find(unit => unit.headsetSerialNo === serialNo);

  if (existingUnit) {
    // Update the existing headset's battery level
    existingUnit.battery = batteryLevel;
  } else {
    // Add new headset data if not found
    unitData.push({ headsetSerialNo: serialNo, battery: batteryLevel });
  }

  console.log("Updated unit data:", unitData);
}

// Handle WebSocket connections
wss.on("connection", (ws) => {
  console.log("A user connected");

  // Send a welcome message and the current game data or null if not set
  ws.send("Welcome to the WebSocket server!");
  ws.send(JSON.stringify(gameData));
  // ws.send(JSON.stringify(unitData)); // Send the current unit data to the client

  // Handle incoming messages from the client
  ws.on("message", (message) => {
    // If the message is a Buffer (binary), convert it to a string
    if (Buffer.isBuffer(message)) {
      message = message.toString("utf-8"); // Convert Buffer to string (UTF-8)
    }

    console.log("Received:", message); // Now it should be a string!

    try {
      const parsedMessage = JSON.parse(message);

      // If the message contains game data, update gameData
      if (parsedMessage.game) {
        gameData = parsedMessage.game;
        console.log("Game Data updated:", gameData);
      }

      // If the message contains headset data, update unitData
      if (parsedMessage.headsetSerialNo && parsedMessage.battery !== undefined) {
        updateUnitData(parsedMessage.headsetSerialNo, parsedMessage.battery);
      }

    } catch (error) {
      console.error("Error parsing message:", error);
    }

    // Broadcast the message to all connected clients including the sender
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message); // Send the message to the sender as well as other clients
      }
    });
  });

  // Handle WebSocket disconnection
  ws.on("close", () => {
    console.log("A user disconnected");
  });
});

// Serve a simple HTML file (optional)
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// Start the HTTP server on port 3000
server.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
