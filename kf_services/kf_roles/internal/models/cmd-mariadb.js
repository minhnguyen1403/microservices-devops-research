const { getNamespace } = require('cls-hooked');
const opentracing = require('opentracing');
const { Tags } = opentracing;
const tracer = require('../jaeger-handle/tracer');
const { FORMAT_HTTP_HEADERS, } = Tags;
const _ = require('lodash')
function pad_with_zeroes(number, length) {
    var my_string = '' + number;
    while (my_string.length < length) {
        my_string = '0' + my_string;
    }
    return my_string;
}
async function queryWithLogging({ query, params }) {
    const startTime = Date.now(); // Thời gian bắt đầu của truy vấn
    /** start span */
    const namespace = getNamespace('request');
    const currentSpan = namespace.get('currentSpan') || namespace.get('span');
    const spanDB = tracer.startSpan('query_database', { childOf: currentSpan.context() });
    const context = spanDB.context();
    spanDB.finish();
    const rawQuery = toRawSQL(query, params);

    let logContent = {
        id: context.spanId.toString('hex'),
        traceId: context.traceId.toString('hex'),
        name: spanDB._operationName,
        kind: Tags.SPAN_KIND_RPC_SERVER.toUpperCase(),
        timestamp: startTime * 1000,
        "localEndpoint": {
            "serviceName": 'kf_mariadb',
        },
        "tags": {
            [Tags.DB_STATEMENT]: rawQuery,
            [Tags.DB_TYPE]: 'mariadb',
            [Tags.DB_USER]: APP_CONFIG.mariadb_config.user,
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
    try {
        const result = await conn.query(query, params);
        /** FOR LOG */
        const endTime = Date.now(); // Thời gian kết thúc của truy vấn
        const duration = endTime - startTime; // Tính thời gian phản hồi
        // Xác định loại truy vấn
        const queryType = identifyQueryType(query);
        // Log thông tin truy vấn
        /** KIBABA */
        loggerDB.info({
            message: 'Database query executed',
            query: rawQuery,
            responseTime: duration,
            queryType,
            table: extractTableName(query)
        });
        /** jaeger */
        logContent = _.merge(logContent, { duration: duration * 1000 });
        syslogLogger.logSpan(JSON.stringify(logContent));
        return result;
    } catch (error) {
        logContent = _.merge(logContent, {
            tags: {
                [Tags.ERROR]: 'true',
                ['error.message']: error.message,
            }
        })
        syslogLogger.logSpan(JSON.stringify(logContent));
        loggerDB.error({
            message: 'Database query error',
            query,
            error: error.message,
            queryType: identifyQueryType(query),
            table: extractTableName(query)
        });
        throw error;
    }
}

function toRawSQL(query, params) {
    // Split the query into parts based on placeholders
    const parts = query.split('?');


    if (parts.length !== params.length + 1) {
        return query;
    }

    // Construct the final query by interleaving parts with escaped params
    let rawQuery = parts[0];
    for (let i = 0; i < params.length; i++) {
        rawQuery += params[i] + parts[i + 1];
    }

    return rawQuery;
}


// Hàm đơn giản để trích xuất tên bảng từ truy vấn SQL
function extractTableName(query) {
    const match = query.match(/from\s+(\S+)/i) || query.match(/into\s+(\S+)/i) || query.match(/update\s+(\S+)/i);
    return match ? match[1] : 'unknown';
}

// Hàm xác định loại truy vấn
function identifyQueryType(query) {
    if (/^\s*select/i.test(query)) return 'SELECT';
    if (/^\s*insert/i.test(query)) return 'INSERT';
    if (/^\s*update/i.test(query)) return 'UPDATE';
    if (/^\s*delete/i.test(query)) return 'DELETE';
    return 'UNKNOWN';
}

// // Sử dụng hàm queryWithLogging để thực hiện truy vấn
// (async () => {
//     try {
//         // Truy vấn SELECT
//         const selectResult = await queryWithLogging('SELECT * FROM yourTable WHERE id = ?', [1]);
//         console.log(selectResult);

//         // Truy vấn INSERT
//         const insertResult = await queryWithLogging('INSERT INTO yourTable (name, value) VALUES (?, ?)', ['name', 'value']);
//         console.log(insertResult);

//         // Truy vấn UPDATE
//         const updateResult = await queryWithLogging('UPDATE yourTable SET value = ? WHERE id = ?', ['newValue', 1]);
//         console.log(updateResult);

//         // Truy vấn DELETE
//         const deleteResult = await queryWithLogging('DELETE FROM yourTable WHERE id = ?', [1]);
//         console.log(deleteResult);
//     } catch (error) {
//         console.error('Error executing query:', error);
//     }
// })();

// function wrapConnection(conn, req) {
//     return new Proxy(conn, {
//         get(target, prop, receiver) {
//             if (prop === 'query') {
//                 return async function(query, params) {
//                     const parentSpan = req.span;
//                     const span = tracer.startSpan('query-mariadb', { childOf: parentSpan });
//                     req.span = span;  // Cập nhật span hiện tại để truy vấn tiếp theo sẽ là con của span này
//                     const startTime = Date.now();

//                     try {
//                         const result = await target.query.call(target, query, params);
//                         const endTime = Date.now();
//                         const duration = endTime - startTime;

//                         const queryType = identifyQueryType(query);
//                         const table = extractTableName(query);

//                         span.setTag('db.type', 'mariadb');
//                         span.setTag('db.statement', toRawSQL(query, params));
//                         span.setTag('db.response_time', duration);
//                         span.setTag('db.query_type', queryType);
//                         span.setTag('db.table', table);

//                         span.finish();
//                         return result;
//                     } catch (error) {
//                         span.setTag(opentracing.Tags.ERROR, true);
//                         span.log({ 'error.object': error, message: error.message });
//                         span.finish();
//                         throw error;
//                     }
//                 }
//             }
//             return Reflect.get(target, prop, receiver);
//         }
//     });
// }

// const wrappedPool = new Proxy(pool, {
//     get(target, prop, receiver) {
//         if (prop === 'getConnection') {
//             return async function(req) {
//                 const conn = await target.getConnection.call(target);
//                 return wrapConnection(conn, req);
//             }
//         }
//         return Reflect.get(target, prop, receiver);
//     }
// });

module.exports = {
    queryWithLogging,
}
