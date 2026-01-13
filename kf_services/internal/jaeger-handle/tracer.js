const { initTracer } = require('jaeger-client');

function handleInitTracer() {
    const config = {
        serviceName: process.env.APP_NAME,
        traceId128bit: true,
        sampler: {
            type: 'const',
            param: 1
        },
        // reporter: {
        //     logSpans: true,
        //     // agentHost: 'localhost',
        //     // agentPort: 14269,
        //     collectorEndpoint: `${APP_CONFIG.JAEGER_URL}/api/traces`
        // },
    }
    const options = {
        logger: {
            info: function logInfo(msg) {
                console.log('INFO ', msg);
            },
            error: function logError(msg) {
                console.log('ERROR', msg);
            },
        },
    };

    return initTracer(config, options);
}

const tracer = handleInitTracer();

module.exports = tracer;