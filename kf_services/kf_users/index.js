const createError = require('http-errors');
const express = require('express');
const path = require('path');
var cookieParser = require('cookie-parser');
const logger = require('morgan');
const bodyParser = require('body-parser');
const http = require('http');
const config = (process.env.NODE_ENV !== 'localhost') ?  require('./config.json') : require('./local-config.json') ;
global.APP_CONFIG = config;
const Tracing = require('./internal/jaeger-handle/tracing')
let app = express();
let server = http.createServer(app);
const {
  UserController
} = require('./controllers');
const { redisClient } = require('./internal/redis')
const { clientErrorHandler, logError, renderErrorHandler } = require('./middlewares/error-handler');
const { SysLogLogger } = require('./internal/logger/syslog.logger')
const addRequestId = require('express-request-id')();
const {createNamespace} = require('cls-hooked');
const _ = require('lodash');
const syslogMiddleware = require('./internal/logger/syslog.logger').config;
const { expressLoggerMiddleware, Logger, LoggerDB } = require('./internal/logger/index');
console.log({env_node: process.env.NODE_ENV})
if (process.env.NODE_ENV === 'production') {
  // const projectDir = path.dirname(require.main.filename);
  // const configPath = path.join(projectDir, 'config.json');
  // let rawdata = fs.readFileSync(configPath);
  // config = JSON.parse(rawdata);
} else {
  //config = _config;
}
async function createApp(app, config){
  // view engine setup
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'pug');

  app.use(logger('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());

  app.use(addRequestId);

  app.use(Tracing.tracing());

  const namespace = createNamespace('request');
  global.namespace = namespace;
  app.use((req, res, next) => {
    namespace.run(() => {
      namespace.set('span', _.cloneDeep(req.span));
      next();
    });
  });

  global.syslogLogger = SysLogLogger;
  global.logger = Logger;
  global.loggerDB = LoggerDB;

  app.use(expressLoggerMiddleware);
  app.use(syslogMiddleware(config.log || {}));

  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    if (req.method === 'OPTIONS') {
      res.header(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, PATCH, HEAD',
      );
      return res.status(200).json({});
    }

    // Allow get filename
    res.header('Access-Control-Expose-Headers', 'Content-Disposition');
    return next();
  });

  // Json parser middleware
  app.use(bodyParser.json({ limit: '10mb' }));

  // Url encoded parser middleware
  app.use(bodyParser.urlencoded({ extended: false }));
  // Config and connect db
  if (config.mariadb_config)
    global.conn = await require('./internal/models').createConnection({ config: config.mariadb_config });
  if (config.REDIS)
    global.redisClient = await redisClient(config.REDIS);
  if(config.CONSUL){
    await require('./internal/consul-client').createConnection({ config: config });
  }

  // catch 404 and forward to error handler




  // error handler
  // app.use(function (err, req, res, next) {
  //   // set locals, only providing error in development
  //   res.locals.message = err.message;
  //   res.locals.error = req.app.get('env') === 'development' ? err : {};
  //   // render the error page
  //   res.status(err.status || 500);
  //   res.render('error');
  // });
  app.start = function(port, callback){
      // error handler
    app.use(logError);
    app.use(clientErrorHandler);
    app.use(renderErrorHandler);
    
    server.keepAliveTimeout = 65000;
    server.headersTimeout =  66000;
    server.setTimeout( 10 * 60 * 1000);
    server = app.listen(port, callback);
  }
  return app;

}

async function main() {
  const appConfig = await createApp(app, config);
  
  UserController.run(appConfig);

  /** handle logic */
  appConfig.use(function (req, res, next) {
    next(createError(404));
  });
  const port = process.env.PORT || '3000';
  appConfig.start(port, () => {
    console.log(`Example app listening on port ${port}!`);
    console.log(`==> http://localhost:${port}`);
});
}

main();
//app.set('port', port);
// server.listen(port);
// server.on('error', onError);
// server.on('listening', onListening);

