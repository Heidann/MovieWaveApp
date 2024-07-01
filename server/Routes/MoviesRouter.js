import express from "express";
import { importMovies } from "../Controllers/MoviesController.js";
import { protect, admin } from "../middlewares/Auth.js";
const router = express.Router();

//********** PUBLIC ROUTES ********//
router.post("/import", importMovies);

//********** PRIVATE ROUTES ********//

//********** ADMIN ROUTES ********//

export default router;
