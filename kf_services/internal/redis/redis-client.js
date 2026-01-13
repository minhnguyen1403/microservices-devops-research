const opentracing = require('opentracing');
const { Tags } = opentracing;
const tracer = require('../jaeger-handle/tracer');
const _ = require('lodash');
const { getNamespace } = require('cls-hooked');

function pad_with_zeroes(number, length) {
    var my_string = '' + number;
    while (my_string.length < length) {
        my_string = '0' + my_string;
    }
    return my_string;
}
async function get(key) {
    const startTime = Date.now(); // Thời gian bắt đầu của truy vấn
    /** get data */
    const response = await redisClient.get(key);
    /** done get data */
    const namespace = getNamespace('request');
    const currentSpan = namespace.get('currentSpan') || namespace.get('span');
    const spanCache = tracer.startSpan('query_cache', { childOf: currentSpan.context() });
    const context = spanCache.context();
    spanCache.finish();
    const endTime = Date.now(); // Thời gian kết thúc của truy vấn
    const duration = endTime - startTime; // Tính thời gian phản hồi
    let logContent = {
        id: context.spanId.toString('hex'),
        traceId: context.traceId.toString('hex'),
        name: spanCache._operationName,
        kind: Tags.SPAN_KIND_RPC_SERVER.toUpperCase(),
        timestamp: startTime * 1000,
        duration: duration * 1000,
        "localEndpoint": {
            "serviceName": 'kf_redis',
        },
        "tags": {
            [Tags.DB_STATEMENT]: `get-${key}`,
            [Tags.DB_TYPE]: 'kfm_redis',
            [Tags.DB_USER]: '',
            [Tags.DB_INSTANCE]: '',
        }
    };
    if (context._parentId) {
        logContent.parentId = context._parentId.toString('hex');
    } else {
        logContent.parentId = context._parentIdStr;
    }

    if (logContent.parentId) {
        // add more zero up 16 long
        logContent.parentId = pad_with_zeroes(logContent.parentId, 16);
    }
    syslogLogger.logSpan(JSON.stringify(logContent));    
    return response;
}

async function set() {

}

module.exports = {
    get,
    set,
};