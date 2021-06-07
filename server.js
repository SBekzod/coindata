console.log('* START *');

// schedule computing
const schedule = require('node-schedule');
const shell = require('shelljs');

// express connection
const http = require('http');
const app = require('./app');

const server = http.createServer(app);
server.listen(process.env.PORT || 4000, function(){
    console.log('Server is listening');
})


