const jwt = require("jsonwebtoken");

const User = require("../models/user");

const auth = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    const error = new Error("Authorization required");
    error.statusCode = 401;
    return next(error);
  }

  const token = authorization.replace("Bearer ", "");

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(payload._id).select(
      "role isActive passwordChangedAt",
    );

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 401;
      return next(error);
    }

    if (user.isActive === false) {
      const error = new Error("Account is inactive");
      error.statusCode = 403;
      return next(error);
    }

    if (
      user.passwordChangedAt &&
      payload.iat * 1000 < user.passwordChangedAt.getTime()
    ) {
      const error = new Error("Session expired after password change");
      error.statusCode = 401;
      return next(error);
    }

    req.user = {
      _id: user._id,
      role: user.role,
    };

    return next();
  } catch (err) {
    if (err.statusCode) {
      return next(err);
    }

    const error = new Error("Invalid or expired token");
    error.statusCode = 401;
    return next(error);
  }
};

module.exports = auth;
