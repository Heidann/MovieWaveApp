import asyncHandler from "express-async-handler"; // to handle errors in async routes
import User from "../Models/UserModels.js";
import bcrypt from "bcryptjs"; // to hash the password
import { generateToken } from "../middlewares/Auth.js";

// @desc Register user
// @route POST /api/users/
// @access Public
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
    res.status(400).json({ message: error.message });
  }
});

// @desc Register user
// @route POST /api/users/login
// @access Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  try {
    // find user in db
    const user = await User.findOne({ email });
    // if user exists conmpare password with hashed password then send user data and token to client
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        image: user.image,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    }
    // if user  not found or password not match send error message
    else {
      res.status(401);
      throw new Error("Invalid email or password");
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ******** PRIVATE CONTROLLERS ********

// @desc Update user profile
// @route PUT /api/users/profile
// @access Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const { fullName, email, image } = req.body;
  try {
    // find user in DB
    const user = await User.findOne(req.user._id);
    // if user exists update user data and save it in DB
    if (user) {
      user.fullName = fullName || user.fullName;
      user.email = email || user.email;
      user.image = image || user.image;

      const updatedUser = await user.save();
      // send updated user data and token to client
      res.json({
        _id: updatedUser._id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        image: updatedUser.image,
        isAdmin: updatedUser.isAdmin,
        token: generateToken(updatedUser._id),
      });
      // else send error message
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @decs Delete user profile
// @route DELETE /api/users
// @access Private
const deleteUserProfile = asyncHandler(async (req, res) => {
  try {
    // find user in DB
    const user = await User.findOneAndDelete(req.user._id);
    // if user exits delete user from DB
    if (user) {
      // if user id admin, throw error message
      if (user.isAdmin) {
        res.status(400);
        throw new Error("Can't delete admin user!");
      }
      // else delete user from DB
      // await user.remove();
      res.json({ message: "User deleted successfully!" });
    }
    // else send error message
    else {
      res.status(404);
      throw new Error("User not found");
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @decs change user password
// @route PUT /api/users/password
// @access Private
const changeUserPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  try {
    // find user in DB
    const user = await User.findById(req.user._id);
    // if user exists conmpare old password with hashed password then update user password and save it in DB
    if (user && (await bcrypt.compare(oldPassword, user.password))) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      user.password = hashedPassword;
      await user.save();
      res.json({ message: "Password changed!" });
    }
    // else send error message
    else {
      res.status(401);
      throw new Error("Invalid old password");
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @decs get all liked movies
// @route GET /api/users/favorite
// @access Private
const getLikedMovies = asyncHandler(async (req, res) => {
  // find user in DB
  const user = await User.findById(req.user._id);
  // if user exits send user liked movies to client
  if (user) {
    // if not exists liked movies
    // if (user.likedMovies.length === 0) {
    //   res.status(404);
    //   throw new Error("No liked movies found");
    // }
    // else send user liked movies to client
    res.json(user.likedMovies);
  }
  // else send error message
  else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @decs Add movie to liked movies
// @route GET /api/users/favorites
// @access Private
const addLikedMovie = asyncHandler(async (req, res) => {
  const { movieId } = req.body;
  // find user in DB
  const user = await User.findById(req.user._id);
  // if user exits add movie to liked movies and save it in DB
  if (user) {
    // check if movie already liked
    // if movie already liked send error message
    if (user.likedMovies.includes(movieId)) {
      res.status(400);
      throw new Error("Movie already liked");
    }

    // if movie already liked send error message
    if (isMovieLiked) {
      res.status(400);
      throw new Error("Movie already liked");
    }
    // else add movie to liked movies and save it in DB
    user.likedMovies.push(movieId);
    await user.save();
    res.json(user.likedMovies);
  }
  // else send error message
  else {
    res.status(404);
    throw new Error("Movie not found");
  }
});

// @decs delete all liked movies
// @route DELETE /api/users/favorites
// @access Private
const deleteLikedMovies = asyncHandler(async (req, res) => {
  try {
    // find user in DB
    const user = await User.findById(req.user._id);
    // if user exits delete all liked movies and save it in DB
    if (user) {
      user.likedMovies = [];
      await user.save();
      res.json({ message: "All liked movies deleted successfully" });
    }
    // else send error message
    else {
      res.status(404);
      throw new Error("User not found");
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ******** ADMIN CONTROLLERS ********

// @decs Get all users
// @route GET /api/users
// @access Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  try {
    // find all users in DB
    const users = await User.find({});
    // if users exits send users to client
    if (users) {
      res.json(users);
    }
    // else send error message
    else {
      res.status(404);
      throw new Error("Users not found");
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @decs Delete users
// @route DELETE /api/users/:id
// @access Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  try {
    // find user in DB
    const user = await User.findOneAndDelete(req.params.id);
    // if user exits delete user from DB
    if (user) {
      // if user id admin, throw error message
      if (user.isAdmin) {
        res.status(400);
        throw new Error("Can't delete admin user!");
      }
      // else delete user from DB
      // await user.remove();
      res.json({ message: "User deleted successfully!" });
    }
    // else send error message
    else {
      res.status(404);
      throw new Error("User not found");
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export {
  registerUser,
  loginUser,
  updateUserProfile,
  deleteUserProfile,
  changeUserPassword,
  getLikedMovies,
  addLikedMovie,
  deleteLikedMovies,
  getUsers,
  deleteUser,
};
