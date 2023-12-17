const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require("cors");
const WebSocket = require('ws');

// Import and use the binance controller file
// require('./app/controllers/binance')

app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
  })
);

app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser())


const wsServer = new WebSocket.Server({ noServer: true });

wsServer.on('connection', (socket) => {
    console.log('WebSocket connected');

    socket.on('message', (message) => {
        console.log('Received message:', message);

    });
    socket.on('close', () => {
        console.log('WebSocket disconnected');
    });
});


app.get('/websocket', (req, res) => {
    wsServer.handleUpgrade(req, req.socket, Buffer.alloc(0), (socket) => {
        wsServer.emit('connection', socket, req);
    });
    res.status(200).send();
});



const PORT = process.env.PORT || 4588;
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});


server.on('upgrade', (request, socket, head) => {
    wsServer.handleUpgrade(request, socket, head, (socket) => {
        wsServer.emit('connection', socket, request);
    });
});
