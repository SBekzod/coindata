let SocketConnect = require('../models/socketConnect');
const moment = require('moment')
const MySql = require('../models/mysql2');
let db = new MySql();

let bitcoin_ws, coin_others, period_btc, period_others;
creatingPairsSocket('main');
creatingPairsSocket('others');

async function ticksRecord(data) {
    try {
        const current_time = moment(data['E']).utc().format("YYYY-MM-DD HH:mm:ss");
        const tick_obj = {pairs: data['s'], col_time: current_time, data: data};
        await db.insertCoinData(tick_obj);
        return true;
    } catch (err) {
        db.con = null;
        console.log('ERROR: ', err);
        console.log('---------------------');
        return false;
    }
}

function creatingPairsSocket(pairs_type, isPrimary = true) {
    if(pairs_type === 'main') {
        bitcoin_ws = new SocketConnect("wss://stream.binance.com:9443/stream?streams=btcbusd@ticker"),
            period_btc = moment.utc().format("YYYY-MM-DD HH:mm:ss");

        bitcoin_ws.collect(async (err, response) => {
            let order = (isPrimary === false) ? 'REC:' : '';
            if (err) {
                console.log(`${order} ${err} on ${pairs_type}`);
                console.log('===========');
            } else {
                period_btc = moment.utc().format("YYYY-MM-DD HH:mm:ss");
                const data = response.data['data'];
                if (await ticksRecord(data)) {
                    console.log(`${order} main ${response.type}, pairs: ${response.data['data']['s']} at ${period_btc}`);
                    console.log('---------------------');
                } else {
                    console.log(`${order} NOT UPDATED MAIN ${moment.utc().format("YYYY-MM-DD HH:mm:ss")}`);
                    console.log('---------------------');
                }
            }
        });

    } else {
        coin_others = new SocketConnect("wss://stream.binance.com:9443/stream?streams=ethbusd@ticker/dogebusd@ticker"),
            period_others = moment.utc().format("YYYY-MM-DD HH:mm:ss");

        coin_others.collect(async (err, response) => {
            let order = (isPrimary === false) ? 'REC:' : '';
            if (err) {
                console.log(`${order} ${err} on ${pairs_type}`);
                console.log('===========');
            } else {
                period_others = moment.utc().format("YYYY-MM-DD HH:mm:ss");
                const data = response.data['data'];
                if (await ticksRecord(data)) {
                    console.log(`${order} others ${response.type}, pairs: ${response.data['data']['s']} at ${period_others}`);
                    console.log('---------------------');
                } else {
                    console.log(`${order} NOT UPDATED OTHERS ${moment.utc().format("YYYY-MM-DD HH:mm:ss")}`);
                    console.log('---------------------');
                }
            }
        });
    }
}


//TODO: JUST NOTICE!!!
    // BINANCE FREE WEBSOCKET did not respond with standard echo-protocol codes
    // and neither with close or error messages after primary connection
    // customized solution: handling with socket muted state

setInterval(function () {
    try {
        console.log(`☄ checker ${moment.utc().format("YYYY-MM-DD HH:mm:ss")} main:${period_btc} others:${period_others} ☄`);

        if (period_btc < moment.utc().add(-20, 'seconds').format("YYYY-MM-DD HH:mm:ss")) {
            period_btc = moment.utc().format("YYYY-MM-DD HH:mm:ss");
            bitcoin_ws.closeSocketConnection();
            setTimeout(() => creatingPairsSocket('main', false), 1000);
        } else {
            console.log(`******* NORMAL MAIN CONNECTION: ${period_btc} *******`);
        }

        if (period_others < moment.utc().add(-20, 'seconds').format("YYYY-MM-DD HH:mm:ss")) {
            period_others = moment.utc().format("YYYY-MM-DD HH:mm:ss");
            coin_others.closeSocketConnection();
            setTimeout(() => creatingPairsSocket('others', false), 1000);
        } else {
            console.log(`******* NORMAL OTHERS CONNECTION: ${period_others} *******`);
        }
        console.log('=====================');

    } catch (err) {
        console.log(`@@ UNDEFINED ERROR: ${err}`)
    }

}, 15000);
