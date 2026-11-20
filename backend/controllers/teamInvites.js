const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const User = require("../models/user");
const TeamInvite = require("../models/teamInvite");

const hashInviteToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const createTeamInvite = async (req, res, next) => {
  try {
    const { name, email } = req.body;

    if (!name?.trim() || !email?.trim()) {
      const error = new Error("Name and email are required");
      error.statusCode = 400;
      throw error;
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      const error = new Error("A user with this email already exists");
      error.statusCode = 409;
      throw error;
    }

    await TeamInvite.deleteMany({
      email: normalizedEmail,
      acceptedAt: null,
    });

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashInviteToken(token);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

    const invite = await TeamInvite.create({
      name: name.trim(),
      email: normalizedEmail,
      role: "employee",
      tokenHash,
      invitedBy: req.user._id,
      expiresAt,
    });

    res.status(201).send({
      _id: invite._id,
      name: invite.name,
      email: invite.email,
      role: invite.role,
      expiresAt: invite.expiresAt,
      token,
    });
  } catch (error) {
    next(error);
  }
};

const getTeamInvite = async (req, res, next) => {
  try {
    const tokenHash = hashInviteToken(req.params.token);

    const invite = await TeamInvite.findOne({
      tokenHash,
      acceptedAt: null,
      expiresAt: { $gt: new Date() },
    }).select("name email role expiresAt");

    if (!invite) {
      const error = new Error("Invite is invalid or has expired");
      error.statusCode = 404;
      throw error;
    }

    res.send(invite);
  } catch (error) {
    next(error);
  }
};

const acceptTeamInvite = async (req, res, next) => {
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

    const tokenHash = hashInviteToken(token);

    const invite = await TeamInvite.findOne({
      tokenHash,
      acceptedAt: null,
      expiresAt: { $gt: new Date() },
    });

    if (!invite) {
      const error = new Error("Invite is invalid or has expired");
      error.statusCode = 404;
      throw error;
    }

    const existingUser = await User.findOne({ email: invite.email });

    if (existingUser) {
      const error = new Error("A user with this email already exists");
      error.statusCode = 409;
      throw error;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: invite.name,
      email: invite.email,
      password: passwordHash,
      role: "employee",
    });

    invite.acceptedAt = new Date();
    await invite.save();

    res.status(201).send({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTeamInvite,
  getTeamInvite,
  acceptTeamInvite,
};
