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

        client.on('connectFailed', (error) => {
            console.log('Connect Error: ' + error);
            callback(error, null);
        })

        client.on('connect', (connection) => {
            console.log('WebSocket Client Connected');

            connection.on('error', function (error) {
                console.log("Connection Error: " + error.toString());
                callback(error, null);
            })

            connection.on('close', function (data) {
                console.log(data)
                console.log('echo-protocol Connection Closed');
                callback(null, {type:"close", data: data});
            })

            connection.on('message', function (event) {
                let message = JSON.parse(event.utf8Data);
                console.log(message);
                callback(null, {type:"msg", data: message});
            })
        })

    }

}

module.exports = SocketConnect;



