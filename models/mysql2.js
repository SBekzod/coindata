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
            database: process.env.NTRY_DATABASE_NAME,
            waitForConnections: true,
            queueLimit: 0,
        })
    }

    async getCoinData() {
        if (!this.con) await this.connection();
        const query_result = await this.con.query('select * from bitcoin_price_collection');
        return query_result[0][0];
    }

    async insertCoinData(ticker) {
        try {
            if (!this.con) {
                let db = await this.connection();
                console.log('* mysql connection established *');
            }
            let prefix = '';
            switch (ticker.pairs) {
                case 'BTCBUSD':
                    prefix = 'bitcoin';
                    break;
                case 'ETHBUSD':
                    prefix = 'ethereum';
                    break;
                case 'BNBBUSD':
                    prefix = 'binance';
                    break;
                case 'ADABUSD':
                    prefix = 'cardano';
                    break;
                case 'DOGEBUSD':
                    prefix = 'doge';
                    break;
                default:
                    throw new Error('unplanned pairs');
                    break;
            }

            let sql = `INSERT INTO ${prefix}_tick_collection SET binstamp = ?, coltime = ?, close = ?, open = ?, high=?, low = ?, volume =?`;
            await this.con.query(sql, [ticker.data['E'], ticker.col_time, ticker.data['c'], ticker.data['o'], ticker.data['h'], ticker.data['l'], ticker.data['v']]);
            return true;
        } catch (err) {
            throw err;
        }

    }

    async insertCaseConnection(data) {
        try {
            if (!this.con) await this.connection();
            let sql = `INSERT INTO ticker_info_cases SET category = ?, case_time_utc = ?, coin_type = ?, timer = ?`;
            await this.con.query(sql, [data.issue, data.case_time, data.coin_type, data.timer]);
            return true;
        } catch (err) {
            return false;
        }

    }

}

module.exports = MySql





