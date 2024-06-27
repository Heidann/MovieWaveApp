import express from "express";
import {
  registerUser,
  loginUser,
  updateUserProfile,
} from "../Controllers/UserController.js";
import { protect } from "../middlewares/Auth.js";
const router = express.Router();

//********** PUBLIC ROUTES ********//
router.post("/", registerUser);
router.post("/login", loginUser);

//********** PRIVATE ROUTES ********//
router.put("/", protect, updateUserProfile);

export default router;
