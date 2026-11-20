const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const User = require("../models/user");
const PasswordReset = require("../models/passwordReset");

const hashResetToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const createTeamMemberPasswordReset = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId).select(
      "name email role isActive",
    );

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    if (user.role !== "employee") {
      const error = new Error("Only employee passwords can be reset here");
      error.statusCode = 400;
      throw error;
    }

    await PasswordReset.deleteMany({
      user: user._id,
      usedAt: null,
    });

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashResetToken(token);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60);

    await PasswordReset.create({
      user: user._id,
      tokenHash,
      requestedBy: req.user._id,
      expiresAt,
    });

    res.status(201).send({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
      expiresAt,
      token,
    });
  } catch (error) {
    next(error);
  }
};

const getPasswordReset = async (req, res, next) => {
  try {
    const tokenHash = hashResetToken(req.params.token);

    const reset = await PasswordReset.findOne({
      tokenHash,
      usedAt: null,
      expiresAt: { $gt: new Date() },
    }).populate("user", "name email role isActive");

    if (!reset || !reset.user) {
      const error = new Error("Password reset link is invalid or has expired");
      error.statusCode = 404;
      throw error;
    }

    res.send({
      name: reset.user.name,
      email: reset.user.email,
      role: reset.user.role,
      isActive: reset.user.isActive,
      expiresAt: reset.expiresAt,
    });
  } catch (error) {
    next(error);
  }
};

const completePasswordReset = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      const error = new Error("Token and password are required");
      error.statusCode = 400;
      throw error;
    }

    if (password.length < 8) {
      const error = new Error("Password must be at least 8 characters long");
      error.statusCode = 400;
      throw error;
    }

    const tokenHash = hashResetToken(token);

    const reset = await PasswordReset.findOne({
      tokenHash,
      usedAt: null,
      expiresAt: { $gt: new Date() },
    });

    if (!reset) {
      const error = new Error("Password reset link is invalid or has expired");
      error.statusCode = 404;
      throw error;
    }

    const user = await User.findById(reset.user).select("+password");

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    user.password = await bcrypt.hash(password, 10);
    user.passwordChangedAt = new Date();
    await user.save();

    reset.usedAt = new Date();
    await reset.save();

    await PasswordReset.updateMany(
      {
        user: user._id,
        _id: { $ne: reset._id },
        usedAt: null,
      },
      {
        $set: { usedAt: new Date() },
      },
    );

    res.send({
      message: "Password updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTeamMemberPasswordReset,
  getPasswordReset,
  completePasswordReset,
};
