console.log('* START *');
// schedule computing
const schedule = require('node-schedule');
const shell = require('shelljs');


// BITCOIN
setTimeout(() => shell.exec('node coins_exec/bitcoin.js'), 5000);

// ETHERIUM
setTimeout(() => shell.exec('node coins_exec/etherium.js'), 10000);

// DOGE
setTimeout(() => shell.exec('node coins_exec/doge.js'), 15000);


// express connection
const http = require('http');
const app = require('./app');

const server = http.createServer(app);
server.listen(process.env.PORT || 4000, function(){
    console.log('Server is listening');
});


