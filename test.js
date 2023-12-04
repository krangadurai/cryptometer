const WebSocket = require('ws');
const axios = require('axios');
require('events').EventEmitter.defaultMaxListeners = 30000;

async function getAllSymbols() {
  try {
    const response = await axios.get('https://api.binance.com/api/v3/exchangeInfo');
    const symbols = response.data.symbols.map(symbol => symbol.symbol);
    return symbols;
  } catch (error) {
    console.error('Error fetching symbols:', error);
    return [];
  }
}

async function connectToKlineWebSocket(symbol, interval) {
  const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@kline_${interval}`);

  ws.on('open', () => {
    console.log(`WebSocket connected for ${symbol} - ${interval}`);
  });

  ws.on('message', (data) => {
    const klineData = JSON.parse(data);
    console.log(`Kline Data for ${symbol} - ${interval}:`, klineData);
    // Process and handle the received Kline data as needed
  });

  ws.on('close', () => {
    console.log(`WebSocket closed for ${symbol} - ${interval}`);
    // Handle WebSocket closure (reconnection, error handling, etc.)
  });

  ws.on('error', (error) => {
    console.error(`WebSocket error for ${symbol} - ${interval}:`, error);
    // Handle WebSocket errors
  });
}

async function connectToAllKlineWebSockets() {
  const intervals = ['1h', '1d', '7d', '1M']; // Intervals: 1 hour, 1 day, 7 days, 1 month

  try {
    const symbols = await getAllSymbols();
    symbols.forEach((symbol,index) => {
    //    if(index<1000){
        intervals.forEach((interval) => {
            console.log(symbol,interval,index)
            connectToKlineWebSocket(symbol, interval);
          });
    //    }
     
    });
  } catch (error) {
    console.error('Error connecting to WebSocket:', error);
  }
}

// Call the function to connect to all Kline WebSockets
connectToAllKlineWebSockets();
