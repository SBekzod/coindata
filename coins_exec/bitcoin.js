let SocketConnect = require('../models/socketConnect');

// Connection to binance websocket connection
let bitcoin_ws = new SocketConnect("wss://dex.binance.org/api/ws/BNB_BTCB-1DE@kline_1m");
bitcoin_ws.collect((err, data) => {
    if(err) console.log(err);
    else {
        console.log(`The TYPE: ${data.type}`);
        console.log(data.data);
    }
});

