const mysql = require('mysql2/promise');

class MySql {
    constructor() {
        this.con = null;
    }

    async connection() {
        this.con = await mysql.createPool({
            host: process.env.NTRY_DATABASE_HOST,
            user: process.env.NTRY_DATABASE_USERNAME,
            password: process.env.NTRY_DATABASE_PASSWORD,
            port: process.env.NTRY_DATABASE_PORT,
            database: process.env.NTRY_DATABASE_NAME
        })
    }

    async getCoinData() {
        if (!this.con) await this.connection();
        const query_result = await this.con.query('select * from bitcoin_price_collection');
        return query_result[0][0];
    }

    async insertCoinData(ticker) {
        try {
            if (!this.con) await this.connection();
            let table = '';
            switch(ticker.pairs) {
                case 'BTCBUSD':
                    table = 'bitcoin_tick_collection';
                    break;
                case 'ETHBUSD':
                    table = 'ethereum_tick_collection';
                    break;
                case 'BNBBUSD':
                    table = 'binance_tick_collection';
                    break;
                case 'ADABUSD':
                    table = 'cardano_tick_collection';
                    break;
                case 'DOGEBUSD':
                    table = 'doge_tick_collection';
                    break;
                default:
                    throw new Error('unplanned pairs');
                    break;
            }

            if(table === 'bitcoin_tick_collection') {
                let sql = 'INSERT INTO bitcoin_tick_collection SET binstamp = ?, coltime = ?, close = ?, open = ?, high=?, low = ?, volume =?'
                const query_result = await this.con.query(sql, [ticker.data['E'], ticker.time, ticker.data['c'], ticker.data['o'], ticker.data['h'], ticker.data['l'], ticker.data['v']]);
                return query_result[0][0];
            } else {
                return ticker.pairs;
            }

        } catch(err) {
            throw err;
        }

    }

}

module.exports = MySql





