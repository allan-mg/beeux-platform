const mongoose = require("mongoose");

const validateObjectId = (...paramNames) => (req, res, next) => {
  const invalidParam = paramNames.find((paramName) => {
    const value = req.params[paramName];
    return value && !mongoose.isObjectIdOrHexString(value);
  });

  if (invalidParam) {
    return res.status(400).send({
      message: `Invalid ${invalidParam}`,
    });
  }

  return next();
};

module.exports = validateObjectId;
