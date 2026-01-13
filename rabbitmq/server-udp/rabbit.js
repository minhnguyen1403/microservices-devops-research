const amqp = require('amqplib/callback_api');

const main = (config) => {
    return new Promise((resolve) => {
        amqp.connect(`amqp://user:password@rabbit.minhnguyen.info.vn:5672`, (error1, connection) => {
            if (error1) {
                throw error1;
            }
            const publishOptions = {
                persistent: true,
            };
            connection.createChannel((error2, channel) => {
                // const exchange = 'kf.jaeger';
                // const type = 'direct'; 
                // channel.assertExchange(exchange, type, {
                //     durable: true
                // });
                // console.log(`Exchange '${exchange}' has been created`);

                if (error2) {
                    throw error2;
                }
                this.pushToJaegerQueue = (msg) => {
                    console.log('received message')
                    channel.publish('kf.jaeger', '', Buffer.from(msg), publishOptions);
                }
                return resolve(this);
            })
        })
    })
}

module.exports = main;