const mysql = require('mysql2/promise')

class MySql {
    constructor() {
        this.con = null
    }

    async connection() {
        this.con = await mysql.createConnection({
            host: '211.253.11.175',
            user: 'root',
            password: 'newdb!@#$ ',
            port: '3306',
            database: 'search'
        })
    }

    async getPlayerInfo(player_id) {
        if (!this.con) await this.connection()
        // important part: execute method
        const query_result = await this.con.execute('select * from sr_players where id = ? ', [player_id])
        return query_result[0][0]
    }

}

module.exports = MySql


// using methods
let db = new MySql()
db.getPlayerInfo('sr:player:1021641').then(data => {
    console.log(data)
}).catch(err => {
    console.log(err.message)
})






