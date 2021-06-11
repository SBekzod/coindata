let SocketConnect = require('../models/socketConnect');
const moment = require('moment')
const MySql = require('../models/mysql2');
const db = new MySql();

// Connection to binance websocket connection
// let bitcoin_ws = new SocketConnect("wss://stream.binance.com:9443/ws/btcbusd@ticker");
// let bitcoin_ws = new SocketConnect("wss://stream.binance.com:9443/stream?streams=btcbusd@ticker");
let bitcoin_ws = new SocketConnect("wss://stream.binance.com:9443/stream?streams=btcbusd@ticker/ethbusd@ticker/bnbbusd@ticker/adabusd@ticker/dogebusd@ticker");


bitcoin_ws.collect(async (err, response) => {
    if (err) console.log(err);
    else {
        console.log(`The TYPE: ${response.type}`);
        const data = response.data['data'];
        ticksRecord(data);
    }
});


function ticksRecord(data) {
    const current_time = moment(data['E']).utc().format("YYYY-MM-DD hh:mm:ss");
    const tick_obj = {pairs: data['s'], col_time: current_time, data: data};
    console.log('TICKER: ', tick_obj);
    db.insertCoinData(tick_obj).then((data) => {
        console.log('result: ', data);
    }).catch((err) => {
        console.log('ERROR: ', err);
    });
}
