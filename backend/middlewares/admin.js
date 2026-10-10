const User = require("../models/user");

const admin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }

    if (user.role !== "admin") {
      const error = new Error("Admin access required");
      error.statusCode = 403;
      return next(error);
    }

    req.adminUser = user;

    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = admin;
