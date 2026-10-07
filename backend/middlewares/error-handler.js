const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  res.status(statusCode).send({
    message: statusCode === 500 ? "Internal server error" : err.message,
  });
};

module.exports = errorHandler;
