import jwt from "jsonwebtoken";
import User from "../Models/UserModels.js";
import asyncHandler from "express-async-handler";

// @decs Authenticated User & get token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1d", // 1 day
  });
};

// protected middleware
// @decs It's used to authenticate and verify whether the user is logged in or not before accessing the application's secure resources
const protect = asyncHandler(async (req, res, next) => {
  let token;
  // check if token exists in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    // set token from Bearer token in headers
    try {
      token = req.headers.authorization.split(" ")[1];
      // verify token and get user id
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // get user id from decoded token
      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (err) {
      console.log(err);
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  }
  // if token doesn't exist in headers send error
  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

export { generateToken, protect };
