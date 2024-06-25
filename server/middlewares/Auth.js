import jwt from "jsonwebtoken";

// @decs Authenticated User & get token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1d", // 1 day
  });
};
export { generateToken };
