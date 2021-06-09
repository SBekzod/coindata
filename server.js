console.log(`* RESTART SERVER ${process.env.NODE_ENV === 'PRODUCTION' ? process.env.NODE_ENV : 'DEVELOPMENT'} *`);

// SCHEDULED TASKS
const schedule = require('node-schedule');
const shell = require('shelljs');
const dotenv = require('dotenv');
dotenv.config({path: process.env.NODE_ENV === 'PRODUCTION' ? './.env.prod' : './.env.dev'});



// bitcoin
setTimeout(() => shell.exec('node coins_exec/bitcoin.js'), 5000);

// etherium
setTimeout(() => shell.exec('node coins_exec/etherium.js'), 10000);

// doge
setTimeout(() => shell.exec('node coins_exec/doge.js'), 15000);


// EXPRESS SERVER CONNECTION
const http = require('http');
const app = require('./app');

const server = http.createServer(app);
server.listen(process.env.PORT, function(){
    console.log(`Server is listening to ${process.env.PORT}`);
});


