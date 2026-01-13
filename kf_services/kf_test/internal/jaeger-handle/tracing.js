const opentracing = require('opentracing');
const { FORMAT_HTTP_HEADERS, Tags } = opentracing;;
const tracer = require('./tracer');
const _ = require('lodash')
function pad_with_zeroes(number, length) {
    var my_string = '' + number;
    while (my_string.length < length) {
        my_string = '0' + my_string;
    }
    return my_string;
}
module.exports.tracing = () => {
    return (req, res, next) => {
        startTracing(req);

        function closeResponse() {
            res.removeListener('close', closeResponse);
            endTracing(req, res);
        }

        res.on('close', closeResponse);
        next();
    };
}

function startTracing(req) {
    const resource = req.path.split('/')[2];
    const method = req.method.toLowerCase()
    const name = `${method}_${resource}`;
    const parentContext = tracer.extract(FORMAT_HTTP_HEADERS, req.headers);
    if (parentContext) {
        req.span = tracer.startSpan(name, { childOf: parentContext });
    } else {
        console.log('no')

        req.span = tracer.startSpan(name);
    }
}

function endTracing(req, res) {
    const span = req.span;
    span.finish();
    const context = span.context();

    const tags = {
        [Tags.HTTP_METHOD]: req.method,
        [Tags.HTTP_URL]: req.originalUrl,
        [Tags.HTTP_STATUS_CODE]: `${res.statusCode}`,
        [Tags.PEER_SERVICE]: 'test',
        ['log.name']: 'name',
        ['minh']: 'test'
        
    };
    if (res._error) {
        tags[Tags.ERROR] = 'true';
        tags['error.message'] = res._error.message;
    }

    if (span.resData && Object.keys(span.resData).length > 0) {
        const body = span.resData;
        const resource = req.path.split('/')[2];
        tags['resource.name'] = resource;

        if (body.id)
            tags['resource.id'] = body.id;

        if (body.code)
            tags['resource.code'] = body.code;
    }

    const logContent = {
        id: context.spanId.toString('hex'),
        traceId: context.traceId.toString('hex'),
        name: span._operationName,
        kind: opentracing.Tags.SPAN_KIND_RPC_CLIENT.toUpperCase(),
        duration: span._duration * 1000,
        timestamp: span._startTime * 1000,
        "localEndpoint": {
            "serviceName": process.env.APP_NAME,
        },
        "remoteEndpoint": {
            "ipv4": req.ip
        },
        "tags": tags,
    };

    if (context._parentId) {
        logContent.parentId = context._parentId.toString('hex');
        logContent.kind = opentracing.Tags.SPAN_KIND_RPC_SERVER.toUpperCase()
    } else {
        logContent.parentId = context._parentIdStr;
    }

    if (logContent.parentId) {
        // add more zero up 16 long
        logContent.parentId = pad_with_zeroes(logContent.parentId, 16);
    }
    //console.log(JSON.stringify(logContent))
    syslogLogger.logSpan(JSON.stringify(logContent));
}

module.exports.endTracing = endTracing;
