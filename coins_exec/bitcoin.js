let SocketConnect = require('../models/socketConnect');
const moment = require('moment')
const MySql = require('../models/mysql2');
let db = new MySql();

let bitcoin_ws = new SocketConnect("wss://stream.binance.com:9443/stream?streams=btcbusd@ticker"),
    coin_others = new SocketConnect("wss://stream.binance.com:9443/stream?streams=ethbusd@ticker/dogebusd@ticker"),
    period_btc = moment.utc().format("YYYY-MM-DD hh:mm:ss"),
    period_others = moment.utc().format("YYYY-MM-DD hh:mm:ss");

bitcoin_ws.collect(async (err, response) => {
    if (err) {
        console.log(`${err} on main`);
    } else {
        period_btc = moment.utc().format("YYYY-MM-DD hh:mm:ss");
        const data = response.data['data'];
        if (await ticksRecord(data)) {
            console.log(`main ${response.type}, pairs: ${response.data['data']['s']} at ${period_btc}`);
            console.log('---------------------');
        } else {
            console.log(`NOT UPDATED MAIN ${moment.utc().format("YYYY-MM-DD hh:mm:ss")}`);
            console.log('---------------------');
        }
    }
});
coin_others.collect(async (err, response) => {
    if (err) {
        console.log(`${err} on others`);
    } else {
        period_others = moment.utc().format("YYYY-MM-DD hh:mm:ss");
        const data = response.data['data'];
        if (await ticksRecord(data)) {
            console.log(`other ${response.type}, pairs: ${response.data['data']['s']} at ${period_others}`);
            console.log('---------------------');
        } else {
            console.log(`NOT UPDATED OTHERS ${moment.utc().format("YYYY-MM-DD hh:mm:ss")}`);
            console.log('---------------------');
        }
    }
});
async function ticksRecord(data) {
    try {
        const current_time = moment(data['E']).utc().format("YYYY-MM-DD hh:mm:ss");
        const tick_obj = {pairs: data['s'], col_time: current_time, data: data};
        await db.insertCoinData(tick_obj);
        return true;
    } catch (err) {
        console.log('ERROR: ', err);
        console.log('---------------------');
        // double secure connection from the next insertion
        db = new MySql();
        return false;
    }
}


//TODO: NOTICE!!! BINANCE WEBSOCKET did not respond with standard echo-protocol codes
// and neither with close or error messages after primary connection
// solution: handling with close and push reconnection of web sockets manually
setInterval(function () {
    try {
        console.log(`☄ checker ${moment.utc().format("YYYY-MM-DD hh:mm:ss")} main:${period_btc} others:${period_others} ☄`);

        if (period_btc < moment.utc().add(-20, 'seconds').format("YYYY-MM-DD hh:mm:ss")) {
            console.log(`******* RECONNECT MAIN: ${period_btc} *******`);
            period_btc = moment.utc().format("YYYY-MM-DD hh:mm:ss");
            bitcoin_ws = new SocketConnect("wss://stream.binance.com:9443/stream?streams=btcbusd@ticker");
            bitcoin_ws.collect(async (err, response) => {
                if (err) {
                    console.log(`REC: ${err} on main`);
                } else {
                    period_btc = moment.utc().format("YYYY-MM-DD hh:mm:ss");
                    const data = response.data['data'];
                    if (await ticksRecord(data)) {
                        console.log(`REC: main ${response.type}, pairs: ${response.data['data']['s']} at ${period_btc}`);
                        console.log('---------------------');
                    } else {
                        console.log(`REC: NOT UPDATED MAIN ${moment.utc().format("YYYY-MM-DD hh:mm:ss")}`);
                        console.log('---------------------');
                    }
                }
            });
        } else {
            console.log(`******* NORMAL MAIN CONNECTION: ${period_btc} *******`);
        }

        if (period_others < moment.utc().add(-20, 'seconds').format("YYYY-MM-DD hh:mm:ss")) {
            console.log(`******* RECONNECT OTHERS: ${period_others} *******`);

            period_others = moment.utc().format("YYYY-MM-DD hh:mm:ss");
            coin_others = new SocketConnect("wss://stream.binance.com:9443/stream?streams=ethbusd@ticker/dogebusd@ticker");
            coin_others.collect(async (err, response) => {
                if (err) {
                    console.log(`REC: ${err} on others`);
                } else {
                    period_others = moment.utc().format("YYYY-MM-DD hh:mm:ss");
                    const data = response.data['data'];
                    if (await ticksRecord(data)) {
                        console.log(`REC: other ${response.type}, pairs: ${response.data['data']['s']} at ${period_others}`);
                        console.log('---------------------');
                    } else {
                        console.log(`REC: NOT UPDATED OTHERS ${moment.utc().format("YYYY-MM-DD hh:mm:ss")}`);
                        console.log('---------------------');
                    }
                }
            });
        } else {
            console.log(`******* NORMAL OTHERS CONNECTION: ${period_others} *******`);
        }

    } catch (err) {
        console.log(`@@ UNDEFINED ERROR: ${err}`)
    }

}, 15000);
