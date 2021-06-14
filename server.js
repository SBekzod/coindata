console.log(`* RESTART SERVER ${process.env.NODE_ENV === 'PRODUCTION' ? process.env.NODE_ENV : 'DEVELOPMENT'} *`);

// SCHEDULED TASKS
const schedule = require('node-schedule');
const shell = require('shelljs');
const dotenv = require('dotenv');
dotenv.config({path: process.env.NODE_ENV === 'PRODUCTION' ? './.env.prod' : './.env.dev'});

// BITCOIN and OTHERS
setTimeout(() => shell.exec('node coins_exec/bitcoin.js', {async: true}), 5000);

// OTHER PAIRS: ethereum, binance, cardano and doge
// setTimeout(() => shell.exec('node coins_exec/others_coins.js', {async: true}), 10000);


// EXPRESS SERVER CONNECTION
const http = require('http');
const app = require('./app');

const server = http.createServer(app);
server.listen(process.env.PORT, function(){
    console.log(`Server is listening to ${process.env.PORT}`);
});


