const { createClient } = require('redis');


async function redisClient(config) {
    const client = await createClient({
        url: `redis://${config.HOST}:${config.PORT}`
    }).on('error', err => console.log('Redis Client Error', err))
        .connect();
    console.log('REDIS connected')
    return client;
}




module.exports = {
    redisClient,
}