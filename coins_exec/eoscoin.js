let SocketConnect = require('../models/socketConnect');
const moment = require('moment')
const MySql = require('../models/mysql2');
let db = new MySql();

let eos_ws, period_eos;
creatingPairsSocket('main');

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
        eos_ws = new SocketConnect("wss://stream.binance.com:9443/stream?streams=eosbusd@ticker"),
            period_eos = moment.utc().format("YYYY-MM-DD HH:mm:ss");

        eos_ws.collect(async (err, response) => {
            let order = (isPrimary === false) ? 'REC:' : '';
            if (err) {
                console.log(`${order} ${err} on ${pairs_type}`);
                console.log('===========');
            } else {
                period_eos = moment.utc().format("YYYY-MM-DD HH:mm:ss");
                const data = response.data['data'];
                if (await ticksRecord(data)) {
                    console.log(`${order} main ${response.type}, pairs: ${response.data['data']['s']} at ${period_eos}`);
                    console.log('---------------------');
                } else {
                    console.log(`${order} NOT UPDATED MAIN ${moment.utc().format("YYYY-MM-DD HH:mm:ss")}`);
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
        console.log(`☄ checker ${moment.utc().format("YYYY-MM-DD HH:mm:ss")} main:${period_eos} ☄`);

        if (period_eos < moment.utc().add(-30, 'seconds').format("YYYY-MM-DD HH:mm:ss")) {
            period_eos = moment.utc().format("YYYY-MM-DD HH:mm:ss");
            eos_ws.closeSocketConnection();
            setTimeout(() => creatingPairsSocket('main', false), 1000);
        } else {
            console.log(`******* NORMAL MAIN CONNECTION: ${period_eos} *******`);
        }
    } catch (err) {
        console.log(`@@ UNDEFINED ERROR: ${err}`)
    }

}, 15000);
