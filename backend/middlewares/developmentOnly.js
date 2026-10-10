const developmentOnly = (req, res, next) => {
  if (process.env.NODE_ENV === "production") {
    const error = new Error("Not found");
    error.statusCode = 404;
    return next(error);
  }

  return next();
};

module.exports = developmentOnly;
