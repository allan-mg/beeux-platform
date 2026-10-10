const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

const {
  moveContractsToAwaitingVerification,
  moveContractsToReadyToSign,
} = require("../utils/contractFlow");

const createUser = (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    const error = new Error("Name, email and password are required");
    error.statusCode = 400;
    return next(error);
  }

  if (password.length < 8) {
    const error = new Error("Password must be at least 8 characters long");
    error.statusCode = 400;
    return next(error);
  }

  return bcrypt
    .hash(password, 10)
    .then((hash) =>
      User.create({
        name,
        email,
        password: hash,
      }),
    )
    .then((user) => {
      res.status(201).send({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    })
    .catch((err) => {
      if (err.code === 11000) {
        const error = new Error("Email already registered");
        error.statusCode = 409;
        return next(error);
      }

      return next(err);
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    const error = new Error("Email and password are required");
    error.statusCode = 400;
    return next(error);
  }

  return User.findOne({ email })
    .select("+password")
    .then((user) => {
      if (!user) {
        const error = new Error("Email or password is incorrect");
        error.statusCode = 401;
        throw error;
      }

      return bcrypt.compare(password, user.password).then((matched) => {
        if (!matched) {
          const error = new Error("Email or password is incorrect");
          error.statusCode = 401;
          throw error;
        }

        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
          expiresIn: "7d",
        });

        res.send({ token });
      });
    })
    .catch(next);
};

const getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
      }

      res.send(user);
    })
    .catch(next);
};

const isLegalProfileComplete = (legalProfile) => {
  const {
    entityType,
    legalName,
    taxId,
    phone,
    representativeName,
    address = {},
  } = legalProfile;

  const requiredAddressFields = [
    address.street,
    address.exteriorNumber,
    address.city,
    address.state,
    address.postalCode,
    address.country,
  ];

  const basicDataComplete =
    entityType &&
    legalName &&
    taxId &&
    phone &&
    requiredAddressFields.every((field) => Boolean(field?.trim()));

  if (!basicDataComplete) {
    return false;
  }

  if (entityType === "business" && !representativeName?.trim()) {
    return false;
  }

  return true;
};

const updateLegalProfile = async (req, res, next) => {
  try {
    const {
      entityType,
      legalName,
      taxId,
      phone,
      representativeName,
      address = {},
    } = req.body;

    const allowedEntityTypes = ["individual", "business"];

    if (!entityType || !allowedEntityTypes.includes(entityType)) {
      const error = new Error("Invalid entity type");
      error.statusCode = 400;
      throw error;
    }

    const legalProfile = {
      entityType,
      legalName,
      taxId,
      phone,
      representativeName,

      address: {
        street: address.street,
        exteriorNumber: address.exteriorNumber,
        interiorNumber: address.interiorNumber,
        neighborhood: address.neighborhood,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
      },
    };

    if (!isLegalProfileComplete(legalProfile)) {
      const error = new Error(
        "Complete all required legal information before continuing",
      );
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          legalProfile,

          "identityVerification.status": "unverified",
          "identityVerification.verificationType": "",
          "identityVerification.provider": "",
          "identityVerification.referenceId": "",
          "identityVerification.verifiedAt": null,
        },
      },
      {
        returnDocument: "after",
        runValidators: true,
      },
    );

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    await moveContractsToAwaitingVerification(req.user._id);

    res.send(user);
  } catch (error) {
    next(error);
  }
};

const verifyCurrentUserForDevelopment = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    if (!isLegalProfileComplete(user.legalProfile)) {
      const error = new Error(
        "Legal profile must be complete before verification",
      );
      error.statusCode = 400;
      throw error;
    }

    user.identityVerification.status = "verified";
    user.identityVerification.verificationType =
      user.legalProfile.entityType === "business" ? "business" : "identity";
    user.identityVerification.provider = "development";
    user.identityVerification.referenceId = `dev-${user._id}-${Date.now()}`;
    user.identityVerification.verifiedAt = new Date();

    await user.save();

    await moveContractsToReadyToSign(user._id);

    res.send({
      message: "Development verification completed",
      user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createUser,
  login,
  getCurrentUser,
  updateLegalProfile,
  verifyCurrentUserForDevelopment,
};
