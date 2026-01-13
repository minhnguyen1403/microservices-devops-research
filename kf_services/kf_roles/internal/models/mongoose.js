// // const { logger } = require('express-winston');
// // const mongoose = require('mongoose');
// // const os = require("os");
// // const { log } = require('util');

// // const targetMethods = [
// //     'aggregate',
// //     'find',
// //     'findOne',
// //     'count',
// //     'remove',
// //     'deleteOne',
// //     'deleteMany',
// //     'countDocuments',
// //     'estimatedDocumentCount',
// //     'findOneAndUpdate',
// //     'findOneAndRemove',
// //     'findOneAndDelete',
// //     'updateMany',
// //     'createOrInsert'
// // ];

// // const preHook = function () {
// //     this.__startTime = Date.now();
// // };

// // const postHook = function () {
// //     try {
// //         const target = this;
// //         if (target.__startTime != null) {
// //             const op =
// //                 target.constructor.name === 'Aggregate' ? 'aggregate' : target.op;
// //             const collectionName = target._collection
// //                 ? target._collection.collectionName
// //                 : target._model.collection.collectionName;
// //             const responseTime = Date.now() - target.__startTime;
// //             if (responseTime > +(process.env.MONGOOSE_QUERY_TIME || '499')) {
// //                 global.loggerDB.debug(
// //                     `${collectionName}.${op} => ${JSON.stringify(target._conditions)}`,
// //                     { responseTime },
// //                 );
// //             } else {
// //                 if (process.env.MONGOOSE_DEBUG == "true") {
// //                     global.loggerDB.debug(
// //                         `${collectionName}.${op} => ${JSON.stringify(target._conditions)}`,
// //                         { responseTime },
// //                     );
// //                 }
// //             }
// //         }
// //     } catch (error) { }
// // };

// //     mongoose.plugin(function (schema, options) {
// //         for (const method of targetMethods) {
// //             schema.pre(method, preHook);
// //             schema.post(method, postHook);
// //         }
// //     });

// // const _conns = {};

// // function _buildConfigOptions(config) {
// //     return {
// //         uri: 'mongodb://' + config.uri.join(','),
// //         options: {
// //             user: config.username,
// //             pass: config.password,
// //             appName: os.hostname(),
// //             dbName: config.dbName,
// //             authSource: config.authSource,
// //             authMechanism: config.authMechanism,
// //             replicaSet: config.replicaSet,
// //             serverSelectionTimeoutMS: config.serverSelectionTimeoutMS,
// //             connectTimeoutMS: config.connectTimeoutMS,
// //             promiseLibrary: global.Promise,
// //             config: {
// //                 autoIndex: true,
// //             },
// //             useNewUrlParser: true,
// //             useUnifiedTopology: true,
// //             useFindAndModify: false,
// //             readPreference: config.readPreference || 'primary',
// //             socketTimeoutMS: config.socketTimeoutMS || 600000,
// //             keepAlive: true,
// //         },
// //     };
// // }

// // function _openConnection(config) {
// //     const conn = _conns[config.dbName];
// //     const _configOptions = _buildConfigOptions(config);
// //     conn.openUri(_configOptions.uri, _configOptions.options);
// // }

// // function getConnection(dbName) {
// //     if (!_conns[dbName]) {
// //         _conns[dbName] = mongoose.createConnection();
// //     }
// //     return _conns[dbName];
// // }

// // exports.getConnection = getConnection;

// // exports.configMongoose = async function (config, onConnected = null) {
// //     const defaultConfig = Array.isArray(config)
// //         ? config.find((c) => c.isDefault === true) || config[0]
// //         : config;

// //     if (!defaultConfig) throw new Error('Can not load db config');
// //     const defaultOptions = _buildConfigOptions(defaultConfig);
// //     mongoose.Promise = global.Promise;
// //     await mongoose.connect(defaultOptions.uri, defaultOptions.options);
// //     _conns[`${defaultConfig.dbName}`] = mongoose.connection;

// //     // let connect = async () => {
// //     //     try {
// //     //         global.logger.warn(
// //     //             `[MongoDB connecting ${JSON.stringify(defaultConfig.uri)}`,
// //     //         );
// //     //         await mongoose.connect(defaultOptions.uri, defaultOptions.options);
// //     //     } catch (error) {
// //     //         global.logger.info(
// //     //             `[MongoDB] connect failed instance ${JSON.stringify(
// //     //                 defaultConfig.uri,
// //     //             )}`,
// //     //         );
// //     //     }
// //     // };

// //     mongoose.connection.on('error', (err) => {
// //         global.logger.error(
// //             `[MongoDB] connect failed instance ${JSON.stringify(defaultConfig.uri)}`,
// //         );
// //         global.logger.error(`[MongoDB] => ${err.toString()}`);
// //     });

// //     mongoose.connection.on('connected', function () {
// //         global.logger.info(
// //             `Mongoose default connection connected ${JSON.stringify(
// //                 defaultConfig.uri,
// //             )}`,
// //         );
// //     });

// //     mongoose.connection.on('disconnected', function () {
// //         global.logger.warn(
// //             `[MongoDB] disconnected instance ${JSON.stringify(defaultConfig.uri)}`,
// //         );
// //         let time = 5000;
// //         let C = setInterval(() => {
// //             if (time < 0) {
// //                 clearInterval(C);
// //                 return connect();
// //             }
// //             global.logger.warn(`[MongoDB] Retry in ${time}ms`);
// //             time = time - 1000;
// //         }, 1000);
// //     });

// //     mongoose.connection.once('open', async () => {
// //         global.logger.info(
// //             `[MongoDB] connected instance ${JSON.stringify(defaultConfig.uri)}`,
// //         );
// //         if (onConnected) {
// //             onConnected();
// //         }
// //     });



// //     // create default connection;
// //     //const defaultOptions = _buildConfigOptions(defaultConfig);
// //     //connect();

// //     // create other config
// //     // if (Array.isArray(config)) {
// //     //     const otherConfigs = config.filter(
// //     //         (c) => c.isDefault === undefined || c.isDefault === false,
// //     //     );
// //     //     for (const _config of otherConfigs) {
// //     //         const dbName = _config.dbName;
// //     //         const _conn = getConnection(dbName);
// //     //         if (_conn.readyState === 0) {
// //     //             _openConnection(_config);
// //     //         }
// //     //     }
// //     // }
// // };

// // exports.mongoose = mongoose;
// // exports.mongoose_delete = require('mongoose-delete');


// const mariadb = require('mariadb');

// // async function createConnection({ config }){
// //     console.log(config)
// //     const connect = await mariadb.createConnection({
// //         host: config.host,
// //         port: config.port,
// //         user: config.user,
// //         password: config.password,
// //         database: config.db,
// //     });
// //     console.log('connected db')
// //     return connect;
// // }



// // module.exports = {
// //     createConnection,
// // }



// // exports.configMongoose = require('./mongoose').configMongoose;
// // exports.mongoose = require('./mongoose').mongoose;
// // exports.mongoose_delete = require('./mongoose').mongoose_delete;
// // exports.getConnection = require('./mongoose').getConnection;

// const mongoose = require('mongoose');
// const os = require("os");
// const targetMethods = [
//     'aggregate',
//     'find',
//     'findOne',
//     'count',
//     'remove',
//     'deleteOne',
//     'deleteMany',
//     'countDocuments',
//     'estimatedDocumentCount',
//     'findOneAndUpdate',
//     'findOneAndRemove',
//     'findOneAndDelete',
//     'updateMany',
//     'createOrInsert'
// ];

// const preHook = function () {
//     this.__startTime = Date.now();
// };

// const postHook = function () {
//     try {
//         const target = this;
//         if (target.__startTime != null) {
//             const op =
//                 target.constructor.name === 'Aggregate' ? 'aggregate' : target.op;
//             const collectionName = target._collection
//                 ? target._collection.collectionName
//                 : target._model.collection.collectionName;
//             const responseTime = Date.now() - target.__startTime;
//             if (responseTime > +(process.env.MONGOOSE_QUERY_TIME || '499')) {
//                 global.loggerDB.debug(
//                     `${collectionName}.${op} => ${JSON.stringify(target._conditions)}`,
//                     { responseTime },
//                 );
//             } else {
//                 if (process.env.MONGOOSE_DEBUG == "true") {
//                     global.loggerDB.debug(
//                         `${collectionName}.${op} => ${JSON.stringify(target._conditions)}`,
//                         { responseTime },
//                     );
//                 }
//             }
//         }
//     } catch (error) { }
// };

// mongoose.plugin(function (schema, options) {
//     for (const method of targetMethods) {
//         schema.pre(method, preHook);
//         schema.post(method, postHook);
//     }
// });


// function _buildConfigOptions(config) {
//     return {
//         uri: 'mongodb://' + config.uri.join(','),
//         options: {
//             user: config.username,
//             pass: config.password,
//             appName: os.hostname(),
//             dbName: config.dbName,
//             authSource: config.authSource,
//             authMechanism: config.authMechanism,
//             replicaSet: config.replicaSet,
//             serverSelectionTimeoutMS: config.serverSelectionTimeoutMS,
//             connectTimeoutMS: config.connectTimeoutMS,
//             promiseLibrary: global.Promise,
//             config: {
//                 autoIndex: true,
//             },
//             useNewUrlParser: true,
//             useUnifiedTopology: true,
//             useFindAndModify: false,
//             readPreference: config.readPreference || 'primary',
//             socketTimeoutMS: config.socketTimeoutMS || 600000,
//             keepAlive: true,
//         },
//     };
// }

// async function connectDB(config){
//     const defaultOptions = _buildConfigOptions(config);
//     await mongoose.connect(defaultOptions.uri, defaultOptions.options);
// }

// module.exports = {
//     mongoose,
//     connectDB,
// };


