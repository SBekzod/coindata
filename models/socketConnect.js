const WebSocketClient = require('websocket').client;
const moment = require('moment');

class SocketConnect {

    constructor(url = 'wss://echo.websocket.org') {
        this.result = true
        this.url = url;
    }

    getting() {

        return new Promise((resolve, reject) => {

            // return nothing
            let client = new WebSocketClient()
            client.connect(this.url);

            client.on('connectFailed', (error) => {
                console.log('Connect Error: ' + error)
                this.result = false
            })

            client.on('connect', (connection) => {
                console.log('WebSocket Client Connected')

                connection.on('error', function (error) {
                    console.log("Connection Error: " + error.toString())
                    this.result = false
                })
                connection.on('close', function (data) {
                    console.log(data)
                    console.log('echo-protocol Connection Closed')
                })
                connection.on('message', function (event) {
                    let message = JSON.parse(event.utf8Data)
                    console.log(message)
                })

            })

            console.log('*****************');

            setTimeout(() => {
                if(!this.result) return reject('connection failed')
                else return resolve('success')
            }, 1000)

        })


    }

}

module.exports = SocketConnect;

let new_connection = new SocketConnect();
new_connection.getting();



