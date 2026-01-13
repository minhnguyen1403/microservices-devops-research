const _ = require('lodash');
const amqp = require('amqplib');
const rp = require('request-promise');

const process = require('process');

let conn, channel, isShutdown = false;
const logMsgQueue = [];


function log(message) {
  console.log(`PID: ${process.pid} - ${message}`);
}

function logError(message) {
  console.log(`PID: ${process.pid}- ERROR - ${message}`);
}

async function pushLog() {
  const pushed = logMsgQueue.splice(0, 10);
  const body = [];
  _.each(pushed, msg => {
    try {
      const content = msg.content.toString().split("KFJAEGERLOG");
      const jsonPart = content[1];
      const logObject = JSON.parse(jsonPart);
      body.push(logObject)
    } catch (error) {
      console.log(error);
    }
    
  });
  //console.log({pushed})
  
  const options = {
    method: 'POST',
    uri: `https://collector.minhnguyen.info.vn/api/v2/spans`,
    body: body,
    json: true
  };
  console.log(JSON.stringify(options))

  rp(options)
    .then(function (parsedBody) {

      console.log(`ok`);
      _.each(pushed, msg => {
        channel.ack(msg);
      });
    })
    .catch(function (err) {
      console.log(`ERROR: ${err.message}, ${JSON.stringify(body)}`);
      _.each(pushed, msg => {
        channel.ack(msg);
      });
    });
}

function enqueueMsg(msg) {
  logMsgQueue.push(msg);
  if (logMsgQueue.length >= 1) pushLog();
}

async function messageHandler(msg) {
  enqueueMsg(msg);
}

async function main() {
  if (isShutdown) return;

  try {
    conn = await amqp.connect({
      hostname: "rabbit.minhnguyen.info.vn",
      port: "5672",
      username: "user",
      password: "password",
    });

    conn.on("error", function (err) {
      if (err.message !== "Connection closing") {
        logError("conn error", err.message);
      }
    });

    conn.on("close", function () {
      logError("reconnecting");
      return setTimeout(main, 10000);
    });

    log("Consumer connected");
    channel = await conn.createChannel();
    const exchange = 'kf.jaeger'; // Exchange name
    const queue = 'jaeger'; // Queue name
    const routingKey = ''; // Routing key (empty for default binding)

    // Declare the exchange (if not already declared)
    await channel.assertExchange(exchange, 'direct', {
        durable: true
    });

    // Declare the queue (if not already declared)
    await channel.assertQueue(queue, {
        durable: true
    });

    // Bind the queue to the exchange with the routing key
    await channel.bindQueue(queue, exchange, routingKey);

    log("Consumer created channel");
    channel.prefetch(10);

    const consumeOptions = {
      noAck: false,
      priority: 10
    };

    channel.consume(
      "jaeger",
      messageHandler,
      consumeOptions,
    );

  } catch (err) {
    logError(err.message);
    setTimeout(main, 10000);
  }
}

function shutdown() {
  isShutdown = true;
  return channel.close().then(() => {
    return conn.close();
  });
}

// quit on ctrl-c when running docker in terminal
process.on('SIGINT', function onSigint() {
  log('Got SIGINT (aka ctrl-c in docker). Graceful shutdown ', new Date().toISOString());
  shutdown().then(() => {
    process.exit(0);
  });
});

// quit properly on docker stop
process.on('SIGTERM', function onSigterm() {
  log('Got SIGTERM (docker container stop). Graceful shutdown ', new Date().toISOString());
  shutdown().then(() => {
    process.exit(0);
  });
});

main();