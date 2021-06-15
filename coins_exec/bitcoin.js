let SocketConnect = require('../models/socketConnect');
const moment = require('moment')
const MySql = require('../models/mysql2');
const db = new MySql();

// Connection to binance websocket connection to collect BITCOIN data
let bitcoin_ws = new SocketConnect("wss://stream.binance.com:9443/stream?streams=btcbusd@ticker");
// Connection to binance websocket connection to collect other four coins data
let coin_others = new SocketConnect("wss://stream.binance.com:9443/stream?streams=ethbusd@ticker/dogebusd@ticker");


let period_btc = moment.utc().format("YYYY-MM-DD hh:mm:ss");
let period_others = moment.utc().format("YYYY-MM-DD hh:mm:ss");
setInterval(function() {
    if(period_btc < moment.utc().add( -10, 'seconds').format("YYYY-MM-DD hh:mm:ss")) {
        period_btc = moment.utc().format("YYYY-MM-DD hh:mm:ss");
        bitcoin_ws = new SocketConnect("wss://stream.binance.com:9443/stream?streams=btcbusd@ticker");
    } else if(period_others < moment.utc().add( -10, 'seconds').format("YYYY-MM-DD hh:mm:ss")) {
        period_others = moment.utc().format("YYYY-MM-DD hh:mm:ss");
        coin_others = new SocketConnect("wss://stream.binance.com:9443/stream?streams=ethbusd@ticker/dogebusd@ticker");
    } else {
        console.log(period_btc);
        console.log('---------------------');
    }
}, 10000);


bitcoin_ws.collect(async (err, response) => {
    if (err) console.log(err);
    else {
        period_btc = moment.utc().format("YYYY-MM-DD hh:mm:ss");
        console.log(`The MAIN TYPE: ${response.type} and Pairs: ${response.data['data']['s']}`);
        console.log('---------------------');
        const data = response.data['data'];
        ticksRecord(data);
    }
});

coin_others.collect(async (err, response) => {
    if (err) console.log(err);
    else {
        period_others = moment.utc().format("YYYY-MM-DD hh:mm:ss");
        console.log(`The OTHER TYPE: ${response.type} and Pairs: ${response.data['data']['s']}`);
        console.log('---------------------');
        const data = response.data['data'];
        ticksRecord(data);
    }
});


function ticksRecord(data) {
    const current_time = moment(data['E']).utc().format("YYYY-MM-DD hh:mm:ss");
    const tick_obj = {pairs: data['s'], col_time: current_time, data: data};
    // console.log('TICKER: ', tick_obj);
    db.insertCoinData(tick_obj).then((resp_data) => {
        console.log(`** result of pairs ${data['s']} => , ${resp_data} **`);
        console.log('---------------------');
    }).catch((err) => {
        console.log('ERROR: ', err);
    });
}
