const User = require("../models/user");

const teamMember = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }

    if (!["employee", "admin"].includes(user.role)) {
      const error = new Error("Team access required");
      error.statusCode = 403;
      return next(error);
    }

    req.teamUser = user;

    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = teamMember;
