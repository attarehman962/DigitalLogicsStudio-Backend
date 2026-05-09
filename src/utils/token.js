const jwt = require("jsonwebtoken");

function assertAuthConfig() {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing in environment variables");
  }
}

function getCookieOptions() {
  const isProduction = process.env.NODE_ENV === "production";
  const cookieExpiresDays = Number(process.env.COOKIE_EXPIRES_DAYS || 7);

  return {
    httpOnly: true,
    secure: isProduction, // true in production (HTTPS only)
    sameSite: isProduction ? "none" : "lax", // "none" required for cross-origin cookies
    maxAge: cookieExpiresDays * 24 * 60 * 60 * 1000,
  };
}

function generateToken(userId) {
  assertAuthConfig();

  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

function setAuthCookie(res, token) {
  res.cookie("token", token, getCookieOptions());
}

function clearAuthCookie(res) {
  res.clearCookie("token", getCookieOptions());
}

module.exports = {
  assertAuthConfig,
  generateToken,
  setAuthCookie,
  clearAuthCookie,
};
