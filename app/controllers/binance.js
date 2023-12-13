const EventEmitter = require('events');

// Create an instance of EventEmitter
const myEmitter = new EventEmitter();

// Set the maximum number of listeners for this specific emitter instance
myEmitter.setMaxListeners(100000); // Replace '15' with your desired limit

const WebSocket = global.WebSocket || global.MozWebSocket || require('ws')

let symbolData = {}; // 24-hour, 1-hour, 4-hour data
function connectToWebSockets() {
  let webSockets = [
    new WebSocket('wss://stream.binance.com:443/ws/!ticker@arr'),
    new WebSocket('wss://stream.binance.com:443/ws/!ticker_1h@arr'),
    new WebSocket('wss://stream.binance.com:443/ws/!ticker_4h@arr'),
  ];
  
  webSockets.forEach((ws, index) => {
    ws.onopen = () => {
      console.log(`WebSocket ${index + 1} connected.`);
    };

    ws.onmessage = (event) => {
      const ticker = JSON.parse(event.data);
      ticker.forEach((element) => handleTickerData(element, index));
      sendSymbolData(symbolData);
      ws.close();
    };

    ws.onclose = () => {
      console.log(`WebSocket ${index + 1} closed.`);
    };

    ws.onerror = (error) => {
      console.error(`WebSocket ${index + 1} encountered error:`, error);
    };
  });
}


function handleTickerData(ticker, index) {
  if (!symbolData[ticker.s]) {
    symbolData[ticker.s] = {};
  }
  symbolData[ticker.s][ticker.e] = ticker;
}
setInterval(() => {
  connectToWebSockets();
}, 3000);


const wss = new WebSocket.Server({ port: 4589 });

function sendSymbolData(updatedData) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(updatedData));
    }
  });
}
