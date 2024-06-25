import asyncHandler from "express-async-handler"; // to handle errors in async routes
import User from "../Models/UserModels.js";
import bcrypt from "bcryptjs"; // to hash the password
import { generateToken } from "../middlewares/Auth.js";
// @desc Register user
// @route POST /api/users/
//@access Public

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, password, image } = req.body;
  try {
    const userExists = await User.findOne({ email });
    // check if user exists
    if (userExists) {
      res.status(400);
      throw new Error("User already exists");
    }
    // else create new user

    //hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt); // hash the password

    // create new user in DB
    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      image,
    });
    // if user is created successfully send user data and token to client
    if (user) {
      res.status(201).json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        image: user.image,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error("Invalid user data");
    }
  } catch (error) {
    console.error(error.message);
  }
});
export { registerUser };
