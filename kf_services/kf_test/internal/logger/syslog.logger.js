const { createLogger, format } = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const Produce = require('glossy').Produce;
const ENV = process.env;
const level = ENV.LOG_LEVEL || 'debug';


const syslogProducer = new Produce({
  appName: ENV.APP_NAME,
  pid: process.pid,
  facility: 'user',
  host: ENV.HOST_IP,
  type: 'RFC5424'
});

const syslogFormat = format.combine(
  format.timestamp(),
  format.printf(({ level, message, label, timestamp }) => {
    return syslogProducer.produce({
      severity: level,  // or a relevant string
      date: new Date(timestamp),
      message: message
    });
  }),
);

const SysLogLogger = createLogger();

SysLogLogger.logSpan = function (span) {
  if (span.includes(`/health/ping`)) return;
  SysLogLogger.info(`KFJAEGERLOG ${span} KFJAEGERLOG`);
};

module.exports.SysLogLogger = SysLogLogger;

module.exports.config = function (config) {

  return (req, res, next) => {
    SysLogLogger.configure({
      level: level,
      format: syslogFormat,
      transports: [
        new DailyRotateFile({
          filename: 'service-%DATE%.log',
          maxSize: 1,
          maxFiles: '14d',
          dirname: '/var/log',
        })
      ],
    });
    next()
  }

};
