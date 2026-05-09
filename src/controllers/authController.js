const User = require("../models/User");
const {
  assertAuthConfig,
  clearAuthCookie,
  generateToken,
  setAuthCookie,
} = require("../utils/token");

function sanitizeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    solvedProblems: user.solvedProblems || [],
    createdAt: user.createdAt,
  };
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function registerUser(req, res, next) {
  try {
    assertAuthConfig();

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error("Name, email, and password are required.");
    }

    if (name.trim().length < 2) {
      res.status(400);
      throw new Error("Name must be at least 2 characters long.");
    }

    if (!validateEmail(email)) {
      res.status(400);
      throw new Error("Please provide a valid email address.");
    }

    if (password.length < 8) {
      res.status(400);
      throw new Error("Password must be at least 8 characters long.");
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      res.status(409);
      throw new Error("An account with this email already exists.");
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
    });

    const token = generateToken(user._id.toString());
    setAuthCookie(res, token);

    res.status(201).json({
      success: true,
      message: "Account created successfully.",
      user: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
}

async function loginUser(req, res, next) {
  try {
    assertAuthConfig();

    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error("Email and password are required.");
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select("+password");

    if (!user || !(await user.matchPassword(password))) {
      res.status(401);
      throw new Error("Invalid email or password.");
    }

    const token = generateToken(user._id.toString());
    setAuthCookie(res, token);

    res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}.`,
      user: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
}

function logoutUser(req, res) {
  clearAuthCookie(res);

  res.status(200).json({
    success: true,
    message: "Logged out successfully.",
  });
}

function getCurrentUser(req, res) {
  res.status(200).json({
    success: true,
    user: sanitizeUser(req.user),
  });
}

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
};
