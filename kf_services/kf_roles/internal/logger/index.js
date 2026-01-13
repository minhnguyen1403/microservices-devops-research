const { createLogger, format, transports, log } = require('winston');
const expressWinston = require('express-winston');
const util = require("util")
const os = require("os");
const _hostname = os.hostname();
const _ = require('lodash');
const {isArray, isNumber, isString, isBoolean} = _;

const { SPLAT, LEVEL } = require('triple-beam');
let esTransport;
let esTransportRequest;
let esTransportDB;
let serviceName = APP_CONFIG.APP_NAME;
const logLevel = 'info';

try {
    require.resolve('winston-elasticsearch');
    const { ElasticsearchTransport } = require('winston-elasticsearch');
    esTransport = new ElasticsearchTransport({
        source: 'service',
        level: logLevel || 'debug',
        indexPrefix: 'kf-services',
        clientOpts: {
            node: APP_CONFIG.ELASTIC_SEARCH
        },
    });
    esTransportRequest = new ElasticsearchTransport({
        source: 'http',
        level: logLevel || 'debug',
        indexPrefix: 'kf-request',
        clientOpts: {
            node:  APP_CONFIG.ELASTIC_SEARCH
        },
    });
    esTransportDB = new ElasticsearchTransport({
        source: 'mongodb',
        level: logLevel || 'debug',
        indexPrefix: 'kf-db',
        clientOpts: {
            node:  APP_CONFIG.ELASTIC_SEARCH
        },
    });
} catch (error) {
    console.log(
        'Module winston-elasticsearch is not installed, please install winston-elasticsearch',
    );
}
const all = format((info) => {
    const splat = info[SPLAT] || [];
    const message = formatObject(info.message);
    const rest = splat.map(formatObject).join(' ');
    info.message = `${message} ${rest}`;
    return {
        service: serviceName,
        level: info.level,
        label: info.label,
        responseTime: info.responseTime,
        message: info.message,
        query: _.get(info, 'query'),
        params: _.get(info, 'params'),
        table: _.get(info, 'table'),
        body: _.get(info, 'body'),
        queryType: _.get(info, 'queryType'),
        [LEVEL]: info[LEVEL],
    };
});
function formatObject(param) {
    if (isNumber(param) || isString(param) || isBoolean(param)) {
        return param;
    }
    let data;
    try {
        data = util.inspect(param);
    } catch (error) {
        data = error.toString();
    }
    console.log(data)
    return data;
}

const developmentFormat = format.combine(
    format.label({
        label: 'development',
    }),
    all(),
    format.timestamp(),
    format.printf(
        (info) =>
            `${info.timestamp} [${info.label}] ${info.level}: ${formatObject(
                info.message,
            )}`,
    ),
);

let Logger;
let LoggerDB;

let _transports = [new transports.Console()];
if (esTransport) {
    _transports = _transports.concat([esTransport]);
}

let _transportsDB = [new transports.Console()];
if (esTransport) {
    _transportsDB = _transports.concat([esTransportDB]);
}

let expressTransport = [];
if (esTransportRequest) {
    expressTransport.push(esTransportRequest);
} else {
    expressTransport.push(new transports.Console());
}

Logger = createLogger({
    level: logLevel,
    format: developmentFormat,
    transports: _transports,
});

LoggerDB = createLogger({
    level: logLevel,
    format: developmentFormat,
    transports: _transportsDB,
});

function isValidJSON(str) {
    try {
        JSON.parse(str);
        return true;
    } catch (e) {
        return false;
    }
}

const expressFormat = format((info) => {
    let rest = {};
    let level = info.level;
    for (const item in info) {
        if (['message', 'level', 'label', [SPLAT]].includes(item) == false) {
            rest['hostname'] = _hostname;
            if (item == 'meta') {
                if (info[item].true) {
                    const request = info[item].true
                    const { body, query, headers } = request
                    const request_src = headers["kdb-request-source"];
                    const request_dest = process.env.APP_NAME

                    rest['request_src'] = request_src
                    rest['request_dest'] = request_dest

                    rest['path'] = info[item].true.path;
                    rest['body'] = JSON.stringify(info[item].true.body);
                    rest['query'] = JSON.stringify(info[item].true.query);
                    rest['headers'] = JSON.stringify(info[item].true.headers);
                    if (info[item].true.headers['mobile-app-version']) {
                        rest['mobile-app-version'] =
                            info[item].true.headers['mobile-app-version'];
                    }
                    if (info[item].true.headers['kpos-app-version']) {
                        rest['kpos-app-version'] =
                            info[item].true.headers['kpos-app-version'];
                    }
                    if (info[item].true.headers['kpos-device-id']) {
                        rest['kpos-device-id'] = info[item].true.headers['kpos-device-id'];
                    }
                    if (info[item].true.headers['x-forwarded-for']) {
                        rest['ip'] = info[item].true.headers['x-forwarded-for'];
                    }
                }
                if (info[item].res) {
                    if (info[item].res.statusCode) {
                        rest['statusCode'] = info[item].res.statusCode;
                    }
                }
                if (info[item].spanId && rest.headers && isValidJSON(rest.headers)) {
                    rest.headers = JSON.stringify(_.merge({}, JSON.parse(rest.headers), { 'x-spanid': info[item].spanId }));
                }
                if (info[item].responseTime) {
                    rest['responseTime'] = info[item].responseTime;
                }
            }
        }
    }
    if (rest['statusCode'] && rest['statusCode'] < 399) level = 'info';
    if (rest['statusCode'] && rest['statusCode'] > 399) level = 'error';
    const result = {
        service: serviceName,
        level: level,
        label: info.label,
        message: info.message,
        [LEVEL]: level,
        ...rest,
        'minh': 'custome'
    };
    return result;
});

let expressLoggerMiddleware = expressWinston.logger({
    transports: expressTransport,
    format: format.combine(
        format.label({
            label:
                process.env.NODE_ENV == 'production' ? 'production' : 'development',
        }),
        expressFormat(),
        format.timestamp(),
    ),
    meta: true,
    requestField: true,
    msg: 'HTTP {{req.method}} {{req.url}}',
    expressFormat: true,
    colorize: false,
    headerBlacklist: [
        'Kingfood-Access-Trusted',
        'token',
        'keep-alive',
        'cache-control',
        'accept-language',
        'if-none-match',
        'x-forwarded-port',
        'upgrade-insecure-requests',
        'x-forwarded-server',
        'x-real-ip',
        'cookie',
        'host',
        'connection',
        'sec-ch-ua',
        'accept',
        'sec-fetch-mode',
        'sec-fetch-user',
        'c-fetch-dest',
        'document',
        'accept-encoding',
        'user-agent',
        'sec-ch-ua-mobile',
        'sec-fetch-site',
        'sec-fetch-dest',
        'authorization',
        'sec-ch-ua-platform',
        'search_token',
    ],
    requestWhitelist: ['body', 'headers', 'query', 'path'],
    blacklistedMetaFields: ['password', 'token', 'access_token'],
    bodyBlacklist: ['password', 'token', 'access_token'],
    ignoreRoute: function (req, res) {
        return false;
    },
    dynamicMeta: (req, res) => {
        return {
            spanId: _.get(req.span.context(), 'spanId', '').toString('hex'),
            metaDataTest: '1'
        };
    },
});

module.exports.Logger = Logger;
module.exports.LoggerDB = LoggerDB;

module.exports.expressLoggerMiddleware = expressLoggerMiddleware;