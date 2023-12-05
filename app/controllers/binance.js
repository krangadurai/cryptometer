const WebSocket = require('ws');

let symbolData = {}; // 24-hour, 1-hour, 4-hour data

function connectToWebSockets() {
  let webSockets = [
    new WebSocket('wss://stream.binance.com:9443/ws/!ticker@arr'),
    new WebSocket('wss://stream.binance.com:9443/ws/!ticker_1h@arr'),
    new WebSocket('wss://stream.binance.com:9443/ws/!ticker_4h@arr'),
  ];
  console.log('hia')

  webSockets.forEach((ws, index) => {
    ws.on('message', (data) => {
      const ticker = JSON.parse(data);
      ticker.forEach((element) => handleTickerData(element, index));
      sendSymbolData(symbolData, 'all');
      if (index === 0) {
        ticker.sort((a, b) => {
          const priceChangeA = parseFloat(a.P);
          const priceChangeB = parseFloat(b.P);
          return priceChangeB - priceChangeA;
        });
        sendSymbolData(ticker, 'topgainer');
        ticker.sort((a, b) => {
          const priceChangeA = parseFloat(a.P);
          const priceChangeB = parseFloat(b.P);
          return priceChangeA - priceChangeB;
        });
        sendSymbolData(ticker, 'toploser');
      }
    });

  });
}

function handleTickerData(ticker, index) {
  if (!symbolData[ticker.s]) {
    symbolData[ticker.s] = {};
  }
  symbolData[ticker.s][ticker.e] = ticker;
}

connectToWebSockets();

const wss = new WebSocket.Server({ port: 4589 });

function sendSymbolData(updatedData, path) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      switch (path) {
        case '/topgainer':
          const dataForTopGainer = {
            path: path,
            data: updatedData,
          };
          client.send(JSON.stringify(dataForTopGainer));
          break;
        case '/toploser':
          const dataForTopLoser = {
            path: path,
            data: updatedData,
          };
          client.send(JSON.stringify(dataForTopLoser));
          break;
        default:
          const dataForDefault = {
            path: path,
            data: updatedData,
          };
          client.send(JSON.stringify(dataForDefault));
          break;
      }
    }
  });
}

