let SocketConnect = require('../models/socketConnect');
// mysql db connection
const MySql = require('../models/mysql2');
const db = new MySql();

// Connection to binance websocket connection
let bitcoin_ws = new SocketConnect("wss://dex.binance.org/api/ws/BNB_BTCB-1DE@kline_1m");
bitcoin_ws.collect((err, data) => {
    if(err) console.log(err);
    else {
        console.log(`The TYPE: ${data.type}`);
        console.log(data.data);
    }
});

// db.getCoinData().then(response => {
//     console.log('** HERE on DB **');
//     console.log(response);
// }).catch(err => console.log('ERROR: ', err));