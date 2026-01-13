module.exports = function (error, req, res, next) {
  if (typeof error.message == 'object') return res.status(error.statusCode || 500).send({ error: error.message });
  return res.status(error.statusCode || 500).send({ error: [error.message], message: error.msg, data: error.data });
};