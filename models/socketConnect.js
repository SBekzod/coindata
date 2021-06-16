const WebSocketClient = require('websocket').client;
const moment = require('moment');

class SocketConnect {

    constructor(url = 'wss://echo.websocket.org') {
        this.url = url;
        console.log('URL: ', this.url);
    }

    collect(callback) {

        let client = new WebSocketClient();
        client.connect(this.url);

        // customized checking data receipt
        let timer = 0;
        let computing = setInterval(() => {
            timer++;
        }, 1000);

        client.on('connectFailed', (error) => {
            console.log('Connect Error: ' + error);
            callback(error, null);
        })

        client.on('connect', (connection) => {
            console.log('WebSocket Client Connected');

            connection.on('error', function (error) {
                console.log("Connection Error: " + error.toString());
                callback('error in connection', null);
            })

            connection.on('close', function (data) {
                console.log('echo-protocol Connection Closed');
                callback('close in connection', null);
            })

            connection.on('message', function (event) {
                if(timer <= 10) {
                    timer = 0;
                    let message = JSON.parse(event.utf8Data);
                    callback(null, {type: "msg", data: message});
                } else {
                    connection.close();
                    clearInterval(computing);
                    callback('comets forced to close', null);
                }

            })
        })

    }

}

module.exports = SocketConnect;



