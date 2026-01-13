module.exports = function (error, req, res, next) {
  //global.logger.error(error.stack || error.toString());
  res._error = error;
  const stt = error.statusCode;
  if (!stt || stt === 500)
    //syslogLogger.logError(error, req, res);
  console.log(error)
  next(error);
};