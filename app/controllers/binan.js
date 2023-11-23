const axios = require('axios');
const { object } = require('webidl-conversions');
const WebSocket = require('ws');

let symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT'];

axios.get('https://api.binance.com/api/v3/exchangeInfo')
  .then((response) => {
    const tradingPairs = response.data.symbols.map((symbol) => symbol.symbol.toUpperCase()); // Ensure symbols are in uppercase
    tradingPairs.sort(); // Sort the symbols alphabetically
    symbols = tradingPairs;
    console.log('All trading pairs:', tradingPairs);
    setInterval(()=>{
        connectToWebSockets()
    },(1000))
 
  })
  .catch((error) => {
    console.error('Error fetching trading pairs:', error);
  });

function connectToWebSockets() {
  const ws24h = new WebSocket('wss://stream.binance.com:9443/ws/!ticker@arr');
  const ws1h = new WebSocket('wss://stream.binance.com:9443/ws/!ticker_1h@arr');
  const ws4h = new WebSocket('wss://stream.binance.com:9443/ws/!ticker_4h@arr');


  let symbolData24h = {};
  let symbolData1h = {};
  let symbolData4h = {};

  function handleTickerData(ticker, index) {
    if (!symbolData[ticker.s]) {
      symbolData[ticker.s] = {};
    }
    symbolData[ticker.s][ticker.e] = ticker;
    console.log(symbolData);
  }

  ws24h.on('message', (data) => {
    const ticker = JSON.parse(data);
   // console.log(ticker)
   ticker.forEach(element => handleTickerData(element, symbolData24h));
  });

  ws1h.on('message', (data) => {
    const ticker = JSON.parse(data);
//    console.log(ticker)
     ticker.forEach(element => handleTickerData(element, symbolData1h));
  });

  ws4h.on('message', (data) => {
    const ticker = JSON.parse(data);
   ticker.forEach(element => handleTickerData(element, symbolData4h));
  });



  [ws24h, ws1h, ws4h].forEach(ws => {
    ws.on('open', () => {
      console.log(`Connected to ${ws.url}`);
     
    });

    ws.on('error', (error) => {
      console.error(`WebSocket error at ${ws.url}:`, error);
    });
  });
}










// const WebSocket = require('ws');

// const intervals = ['1M', '1w', '1d', '1h', '4h']; // Intervals: 3 days, 7 days, 1 hour, 4 hours, 1 day

// function subscribeToKlineStreams(symbol, interval) {
//   const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@kline_${interval}`);

//   ws.on('open', () => {
//     console.log(`Connected to ${symbol} Kline ${interval} Stream`);
//   });

//   ws.on('message', (data) => {
//     const klineData = JSON.parse(data);
//     console.log(`Kline ${interval} Data for ${symbol}:`, klineData);
//     // Process the received Kline/Candlestick data as needed
//   });

//   ws.on('error', (error) => {
//     console.error('WebSocket error:', error);
//   });
// }

// // Function to subscribe to Kline streams for all intervals and symbols
// function subscribeToAllKlineStreams(intervals) {
//   //const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT']; // Replace with all trading pairs

//   symbols.forEach((symbol) => {
//     intervals.forEach((interval) => {
//       subscribeToKlineStreams(symbol, interval);
//     });
//   });
// }













// const axios = require('axios');

// // Function to fetch historical price data for a symbol over a specific timeframe
// async function getHistoricalData(symbol, interval, limit) {
//   try {
//     const response = await axios.get(`https://api.binance.com/api/v1/klines`, {
//       params: {
//         symbol: symbol,
//         interval: interval,
//         limit: limit
//       }
//     });

//     // Process the response data here (e.g., calculate price changes)
//     const klineData = response.data;
//     // Perform calculations or operations with the fetched data as needed

//     return klineData; // Return the fetched data or processed information
//   } catch (error) {
//     console.error('Error fetching historical data:', error);
//     throw error;
//   }
// }

// // Function to fetch historical price data for multiple symbols
// async function fetchHistoricalDataForSymbols(symbols) {
//   const interval = '1d'; // Daily interval
//   const sevenDays = 7;
//   const thirtyDays = 30;

//   for (const symbol of symbols) {
//     const sevenDayData = await getHistoricalData(symbol, interval, sevenDays);
//     const thirtyDayData = await getHistoricalData(symbol, interval, thirtyDays);

//     // Process the fetched data (calculate price changes, etc.)
//     // Output or use the retrieved data as needed
//     console.log(`Symbol: ${symbol}`);
//     console.log('7-Day Data:', sevenDayData);
//     console.log('30-Day Data:', thirtyDayData);
//   }
// }

// // List of symbols for which you want historical data
// const symbolList = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT']; // Add more symbols as needed

// // Call the function to fetch historical data for the symbols
// fetchHistoricalDataForSymbols(symbolList);
const WebSocket = require('ws');
const axios  = require('axios')
const INTERVAL_24_HOURS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
let symbols = []; // To store fetched symbols
let symbolData = {}; // 24-hour, 1-hour, 4-hour data
require('events').EventEmitter.defaultMaxListeners = 2000;
async function fetchSymbols() {
  try {
    const response = await axios.get('https://api.binance.com/api/v3/exchangeInfo');
    const allSymbols = response.data.symbols.map((symbol) => symbol.symbol);
    console.log('Total Symbols:', allSymbols.length);

    const symbolBatches = [];
    for (let i = 0; i < allSymbols.length; i += 100) {
      symbolBatches.push(allSymbols.slice(i, i + 100));
    }
   console.log(symbolBatches)
    console.log('Symbol batches:', symbolBatches.length);

    // Process each batch of symbols
    for (const symbolsBatch of symbolBatches) {
      await fetchInitialData(symbolsBatch);
    }
  } catch (error) {
    console.error('Error fetching symbols:', error);
    // Retry after some time in case of an error
    // setTimeout(fetchSymbols, 5000); // Retry after 5 seconds
  }
}
fetchSymbols()
async function fetchInitialData() {
  try {
    const intervals = ['1h', '4h', '1d', '7d', '1M']; // Intervals: 1 hour, 4 hours, 1 day, 1 week, 1 month



      for (const interval of intervals) {
        const response = await axios.post(`https://api.binance.com/api/v3/ticker?symbols=${symbols}windowSize=1d&type=FULL`);
        symbolData[symbol][interval] = response.data;
      }

    console.log('Initial data fetched:', symbolData);
    // connectToWebSockets(); // After fetching initial data, establish WebSocket connections

    // Reset fetch after 24 hours
   setTimeout(fetchInitialData, INTERVAL_24_HOURS);
  } catch (error) {
   console.error('Error fetching initial data:', error);
    // Retry after 24 hours in case of an error
setTimeout(fetchInitialData, INTERVAL_24_HOURS);
  }
}





function connectToWebSockets() {
  webSockets = [
    new WebSocket('wss://stream.binance.com:9443/ws/!ticker@arr'),
    new WebSocket('wss://stream.binance.com:9443/ws/!ticker_1h@arr'),
    new WebSocket('wss://stream.binance.com:9443/ws/!ticker_4h@arr'),
  ];

  webSockets.forEach((ws, index) => {
    ws.on('message', (data) => {
      const ticker = JSON.parse(data);
      console.log(ticker)
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

// connectToWebSockets();

const wss = new WebSocket.Server({ port: 8080 });
function sendSymbolData(updatedData) {
    
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
       // console.log(updatedData)
      client.send(JSON.stringify(updatedData));
    }
  });
}
