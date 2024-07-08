module.exports = function(error, req, res, next) {
  res.status(error.statusCode || 500).render('error', {error: error.statusCode || 500});
};
