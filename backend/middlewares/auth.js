const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    const error = new Error("Authorization required");
    error.statusCode = 401;
    return next(error);
  }

  const token = authorization.replace("Bearer ", "");

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    req.user = payload;

    return next();
  } catch (err) {
    const error = new Error("Invalid or expired token");
    error.statusCode = 401;
    return next(error);
  }
};

module.exports = auth;
