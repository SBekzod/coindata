const WebSocketClient = require('websocket').client;
const moment = require('moment');
const MySql = require('../models/mysql2');
let db = new MySql();

class SocketConnect {

    constructor(url = 'wss://echo.websocket.org') {
        this.url = url;
        this.clientConnection = null;
        console.log('URL: ', this.url);
    }

    collect(callback) {

        let client = new WebSocketClient();
        client.connect(this.url);

        // customized: checking data receipt
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
            this.clientConnection = connection;

            this.clientConnection.on('error', (error) => {
                console.log("Connection Error: " + error.toString());
                callback('LOGGER: error in connection', null);
            })

            this.clientConnection.on('close', (data) => {
                callback('LOGGER: echo-protocol Connection Closed', null);
            })

            this.clientConnection.on('message', (event) => {
                timer = 0;
                let message = JSON.parse(event.utf8Data);
                callback(null, {type: "msg", data: message});

                // Checking whether msg is received in the next five seconds duration
                setTimeout(() => {
                    if (timer >= 5) {
                        let coin_type = 'BNB';
                        let case_time = moment.utc().format('YYYY-MM-DD HH:mm:ss');
                        db.insertCaseConnection({
                            timer: timer,
                            coin_type: coin_type,
                            issue: 'socket_muted',
                            case_time: case_time
                        }).then(() => console.log('recorded'))
                            .catch(err => console.log(`Record error: ${err}`));
                        timer = 0;

                        // Closing Client Connection
                        this.closeSocketConnection();
                        clearInterval(computing);
                        callback('LOGGER: comets forced launched close order', null);
                    }
                }, 5000);

            })

        })

    }

    closeSocketConnection() {
        this.clientConnection.close();
    }

}

module.exports = SocketConnect;




