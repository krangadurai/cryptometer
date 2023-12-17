const WebSocket = require("ws");
const axios = require("axios");
let symbol = 'BTCUSDT'

let BWS = new WebSocket(`wss://stream.binance.com:9443/ws`);
let cData = {};


BWS.onopen = () => {
    console.log('Websocket BWS connected');
    const subscriptionMsg = {
        method: "SUBSCRIBE",
        params: [
            symbol.toLowerCase() + "@kline_1s",
            //   symbol+"@kline_1m",
            //   symbol+"@kline_15m",
            //   symbol+"@kline_30m",
            //   symbol+"@kline_1h",
            //   symbol+"@kline_1d",
            //   symbol+"@kline_1w",
            //   symbol+"@kline_1M"
        ],
        id: 1
    };

    BWS.send(JSON.stringify(subscriptionMsg));
}



BWS.onclose = () => {
    console.log('BWS websocket colsed')
}

BWS.onmessage = (event) => {
    const ticker = JSON.parse(event.data);
    // console.log(ticker)
    if (ticker.s) {
        if (!cData[ticker.s]) {
            cData[ticker.s] = {}
        }

        cData[ticker.s][ticker.k.t] = ticker;
        // setTimeout(()=>{
        //     // BWS.close();
        //   console.log(cData)
        // },10000)

    }

};

// Assuming cData is an object containing timestamps as keys and objects with 'k' and 'c' properties
// Example: cData = { timestamp1: { k: value1, c: value2 }, timestamp2: { k: value3, c: value4 }, ... }
setTimeout(() => {
    setInterval(() => {
        let EndTime = Date.now() - 2000;
        let StartTime = EndTime - (2 * 1000); // 2 seconds ago

        EndTime = Math.floor(EndTime / 1000) * 1000; // Removing last three digits
        StartTime = Math.floor(StartTime / 1000) * 1000; // Removing last three digits\
        // console.log(
        //     EndTime,
        //     StartTime,cData)
        if (StartTime && EndTime) {
            // console.log(
            //     EndTime,
            //     StartTime,
            //     cData[symbol], 
            //     cData[symbol][EndTime]   
            //   );

            if (cData[symbol][StartTime] && cData[symbol][EndTime]) {
                const changePercentage = calculateChangePercentage(cData[symbol][StartTime].k.c, cData[symbol][EndTime].k.c);
                calculate1mVolume(cData[symbol])
            //   );
             console.log(cData[symbol][EndTime-(5*60 *1000)])
                if(cData[symbol][EndTime-(5*60*1000)]){
                    calculate5mVolume(cData[symbol])
                }
                // console.log(`Change percentage: ${changePercentage}`);
            } else {
                console.log('Data for start or end time not available');
            }
        }

    }, 4000);
}, 60000)
const date = new Date();

console.log(date.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));

function calculateChangePercentage(oldValue, newValue) {
    if (oldValue === 0) {
        return 'Cannot calculate percentage change when the initial value is zero.';
    }

    const change = newValue - oldValue;
    const changePercentage = (change / oldValue) * 100;

    return changePercentage.toFixed(2) + '%';
}


function calculate1mVolume(data) {
    let EndTime = Date.now() - 2000;
    EndTime = Math.floor(EndTime / 1000) * 1000;
    let BuyVolume =0;
    let SellVolume = 0;
     let StartTime = EndTime-60000;
    
    for (let i = EndTime; i > EndTime - 60000; i -= 1000) {
        console.log(i)
    
        let d =data[i];
        BuyVolume += parseFloat(d.k.v);
        SellVolume += parseFloat(d.k.V);
    }

    let changePercentage1m = calculateChangePercentage(data[StartTime].k.c, data[EndTime].k.c);
    let TotalVolume = SellVolume + BuyVolume;
    let SellVolumePerCentage = (SellVolume / TotalVolume) * 100;
    let BuyVolumePerCentage = (BuyVolume / TotalVolume) * 100;

    console.log(changePercentage1m, BuyVolume, SellVolume, SellVolumePerCentage, BuyVolumePerCentage)

}


function calculate5mVolume(data) {
    let EndTime = Date.now() - 2000;
    EndTime = Math.floor(EndTime / 1000) * 1000;
    let BuyVolume =0;
    let SellVolume = 0;
     let StartTime = EndTime-(5*60000);
    
    for (let i = EndTime; i > EndTime -(5* 60000); i -= 1000) {
        console.log(i)
        let d =data[i];
        BuyVolume += parseFloat(d.k.v);
        SellVolume += parseFloat(d.k.V);
    }

    let changePercentage1m = calculateChangePercentage(data[StartTime].k.c, data[EndTime].k.c);
    let TotalVolume = SellVolume + BuyVolume;
    let SellVolumePerCentage = (SellVolume / TotalVolume) * 100;
    let BuyVolumePerCentage = (BuyVolume / TotalVolume) * 100;

    console.log(' 5m',changePercentage1m, BuyVolume, SellVolume, SellVolumePerCentage, BuyVolumePerCentage)

}