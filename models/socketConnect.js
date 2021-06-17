const WebSocketClient = require('websocket').client;
const moment = require('moment');
const MySql = require('../models/mysql2');
let db = new MySql();

class SocketConnect {

    constructor(url = 'wss://echo.websocket.org') {
        this.url = url;
        console.log('URL: ', this.url);
        this.client = null;
    }

    collect(callback) {

        this.client = new WebSocketClient();
        this.client.connect(this.url);

        // customized: checking data receipt
        let timer = 0;
        let computing = setInterval(() => {
            timer++;
        }, 1000);

        this.client.on('connectFailed', (error) => {
            console.log('Connect Error: ' + error);
            callback(error, null);
        })

        this.client.on('connect', (connection) => {
            console.log('WebSocket Client Connected');

            connection.on('error', (error) => {
                console.log("Connection Error: " + error.toString());
                callback('error in connection', null);
            })

            connection.on('close', (data) => {
                console.log('echo-protocol Connection Closed');
                callback('close in connection', null);
            })

            connection.on('message', (event) => {
                timer = 0;
                let message = JSON.parse(event.utf8Data);
                callback(null, {type: "msg", data: message});

                // customized: checking whether msg is received in the next five seconds duration
                setTimeout(() => {
                    if (timer >= 5) {
                        let coin_type = (message['data']['s'] === "BTCBUSD") ? 'BTC' : 'ETH/DOGE';
                        let case_time = moment.utc().format('YYYY-MM-DD hh:mm:ss');
                        db.insertCaseConnection({
                            timer: timer,
                            coin_type: coin_type,
                            issue: 'socket_muted',
                            case_time: case_time
                        }).then(() => console.log('recorded'))
                            .catch(err => console.log(`Record error: ${err}`));
                        timer = 0;
                        this.closeSocketConnection();
                        clearInterval(computing);
                        callback('comets forced to close', null);
                    }
                }, 5000);
            })

        })

    }

    closeSocketConnection() {
        this.client.close();
        this.client = null;
    }

}

module.exports = SocketConnect;




