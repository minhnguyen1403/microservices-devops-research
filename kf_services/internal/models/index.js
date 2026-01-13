const mariadb = require('mariadb');

async function createConnection({ config }){
    const connect = await mariadb.createConnection({
        host: config.host,
        port: config.port,
        user: config.user,
        password: config.password,
        database: config.db,
    });
    console.log('connected db')
    return connect;
}



module.exports = {
    createConnection,
}
