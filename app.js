const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const connections = new Map();

wss.on('connection', (ws, req) => {
    const route = req.url.slice(1); 
    console.log(`WebSocket connection established for route: ${route}`);

    if (!connections.has(route)) {
        connections.set(route, []);
    }
    connections.get(route).push(ws);

    ws.on('message', (message) => {
        console.log(`Received message on ${route}:`, message);
        // Handle messages if needed
    });

    ws.on('close', () => {
        console.log(`WebSocket connection closed for route: ${route}`);
        const clients = connections.get(route) || [];
        connections.set(route, clients.filter((client) => client !== ws));
    });
});

// Start the server
server.listen(3000, () => {
    console.log("WebSocket server running on port 3000");
});
