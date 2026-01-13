const mongoose = require('mongoose');
const opentracing = require('opentracing');
const { Tags } = opentracing;
const tracer = require('../jaeger-handle/tracer');
const { getNamespace } = require('cls-hooked');

function pad_with_zeroes(number, length) {
    var my_string = '' + number;
    while (my_string.length < length) {
        my_string = '0' + my_string;
    }
    return my_string;
}

const functions = [
    "count",
    "deleteMany",
    "deleteOne",
    "find",
    "findOne",
    "findOneAndDelete",
    "findOneAndRemove",
    "findOneAndUpdate",
    "update",
    "updateOne",
    "updateMany",
];

function logTracing(req, statement, span, user) {
    const context = span.context();

    const logContent = {
        id: context.spanId.toString('hex'),
        traceId: context.traceId.toString('hex'),
        name: span._operationName,
        kind: Tags.SPAN_KIND_RPC_CLIENT.toUpperCase(),
        duration: span._duration * 1000,
        timestamp: span._startTime * 1000,
        "localEndpoint": {
            "serviceName": process.env.APP_NAME,
        },
        "tags": {
            [Tags.DB_STATEMENT]: statement,
            [Tags.DB_TYPE]: 'mongodb',
            [Tags.DB_USER]: mongoose.connection.user,
            [Tags.DB_INSTANCE]: '',
        }
    };
    console.log('LOG DATABASES: ')
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
}

module.exports = function loadPlugin(req, schema, parentContext) {
    console.log(mongoose.connection.user)
    // Document middleware
    schema.pre('save', function () {
        this.start = Date.now();
        this.span = tracer.startSpan('query_save', { childOf: parentContext });
    });

    schema.post('save', function () {
        this.span.finish();
        const context = this.span.context();

        syslogLogger.logQuery(
            new Date().toJSON(),
            Date.now() - this.start,
            null,
            'primary',
            'save',
            this.constructor.collection.name,
            null,
            context.traceId.toString('hex'),
            context.spanId.toString('hex'),
        );

        logTracing(req, 'save', this.span);
    });

    schema.pre('remove', function () {
        this.start = Date.now();
        this.span = tracer.startSpan('query_remove', { childOf: parentContext });
    });

    schema.post('remove', function () {
        this.span.finish();

        syslogLogger.logQuery(
            new Date().toJSON(),
            Date.now() - this.start,
            null,
            'primary',
            'remove',
            this.constructor.collection.name,
            null,
            null,
            null,
        );

        logTracing(req, 'remove', this.span);
    });

    // Query middleware
    schema.pre(functions, { query: true }, function () {
        this.start = Date.now();
        this.span = tracer.startSpan('query_' + this.op, { childOf: parentContext });
    });

    schema.post(functions, { query: true }, function () {
        let queryType = this.mongooseCollection.conn.db.readPreference.mode;
        if (this.options.readPreference) {
            queryType = this.options.readPreference.mode;
        }

        this.span.finish();
        const context = this.span.context();

        syslogLogger.logQuery(
            new Date().toJSON(),
            Date.now() - this.start,
            null,
            queryType,
            this.op,
            this.mongooseCollection.name,
            null,
            context.traceId.toString('hex'),
            context.spanId.toString('hex'),
        );

        logTracing(req, this.op, this.span, this.mongooseCollection.conn.user);
    });
};
