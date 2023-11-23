const WebSocket = require('ws');

let symbolData = {}; // 24-hour, 1-hour, 4-hour data

function connectToWebSockets() {
  webSockets = [
    new WebSocket('wss://stream.binance.com:9443/ws/!ticker@arr'),
    new WebSocket('wss://stream.binance.com:9443/ws/!ticker_1h@arr'),
    new WebSocket('wss://stream.binance.com:9443/ws/!ticker_4h@arr'),
  ];

  webSockets.forEach((ws, index) => {
    ws.on('message', (data) => {
      const ticker = JSON.parse(data);
    //   console.log(ticker)
      ticker.forEach((element) => handleTickerData(element, index));
      sendSymbolData(symbolData);
    });

    ws.on('open', () => {
      console.log(`Connected to ${ws.url}`);
    });

    ws.on('error', (error) => {
      console.error(`WebSocket error at ${ws.url}:`, error);
    });
  });
}

function handleTickerData(ticker, index) {
  if (!symbolData[ticker.s]) {
    symbolData[ticker.s] = {};
  }
  symbolData[ticker.s][ticker.e] = ticker;
  //console.log(symbolData);
 
}

connectToWebSockets();

const wss = new WebSocket.Server({ port: 8080 });
function sendSymbolData(updatedData) {
    
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
       // console.log(updatedData)
      client.send(JSON.stringify(updatedData));
    }
  });
}
