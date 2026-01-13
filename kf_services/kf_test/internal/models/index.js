const mariadb = require('mariadb');
const logPlugin = require('./log.plugin');

// async function createConnection({ config }){
//     console.log(config)
//     const connect = await mariadb.createConnection({
//         host: config.host,
//         port: config.port,
//         user: config.user,
//         password: config.password,
//         database: config.db,
//     });
//     console.log('connected db')
//     return connect;
// }



// module.exports = {
//     createConnection,
// }



// exports.configMongoose = require('./mongoose').configMongoose;
// exports.mongoose = require('./mongoose').mongoose;
// exports.mongoose_delete = require('./mongoose').mongoose_delete;
// exports.getConnection = require('./mongoose').getConnection;

const mongoose = require('mongoose');
const os = require("os");
const targetMethods = [
    'aggregate',
    'find',
    'findOne',
    'count',
    'remove',
    'deleteOne',
    'deleteMany',
    'countDocuments',
    'estimatedDocumentCount',
    'findOneAndUpdate',
    'findOneAndRemove',
    'findOneAndDelete',
    'updateMany',
    'createOrInsert'
];

const preHook = function () {
    this.__startTime = Date.now();
};

const postHook = function () {
    try {
        const target = this;
        if (target.__startTime != null) {
            const op =
                target.constructor.name === 'Aggregate' ? 'aggregate' : target.op;
            const collectionName = target._collection
                ? target._collection.collectionName
                : target._model.collection.collectionName;
            const replicaSetName = target.mongooseCollection.conn.db.s.topology.s.replicaSetName;
            console.log(replicaSetName)
            const responseTime = Date.now() - target.__startTime;
            if (responseTime > +(process.env.MONGOOSE_QUERY_TIME || '499')) {
                loggerDB.info(
                    `${collectionName}.${op} => ${JSON.stringify(target._conditions)}`,
                    { responseTime },
                );
            } else {
                if (process.env.MONGOOSE_DEBUG == "true") {
                    loggerDB.info(
                        `${collectionName}.${op} => ${JSON.stringify(target._conditions)}`,
                        { responseTime },
                    );
                }
            }
        }
    } catch (error) { }
};

mongoose.plugin(function (schema, options) {
    for (const method of targetMethods) {
        schema.pre(method, preHook);
        schema.post(method, postHook);
    }
});


function _buildConfigOptions(config) {
    return {
        uri: 'mongodb://' + config.uri.join(','),
        options: {
            user: config.username,
            pass: config.password,
            appName: os.hostname(),
            dbName: config.dbName,
            authSource: config.authSource,
            authMechanism: config.authMechanism,
            replicaSet: config.replicaSet,
            serverSelectionTimeoutMS: config.serverSelectionTimeoutMS,
            connectTimeoutMS: config.connectTimeoutMS,
            promiseLibrary: global.Promise,
            config: {
                autoIndex: true,
            },
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            readPreference: config.readPreference || 'primary',
            socketTimeoutMS: config.socketTimeoutMS || 600000,
            keepAlive: true,
        },
    };
}

async function connectDB(config){
    const defaultOptions = _buildConfigOptions(config);
    await mongoose.connect(defaultOptions.uri, defaultOptions.options);
}

module.exports = {
    mongoose,
    connectDB,
    logPlugin,
};
