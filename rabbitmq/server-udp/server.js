const dgram = require('dgram');
const server = dgram.createSocket('udp4');

const main = (config, fnMessage) => {
    server.on('error', (err) => {
        console.error(err.stack);
        server.close();
    });
    server.on('listening', listening);
    server.on('message', fnMessage);
    server.bind(config.port);
    return server;
}

const listening = (msg, info) => {
    const address = server.address();
    console.log(`server listening ${address.address}:${address.port}`);
}

module.exports = main
