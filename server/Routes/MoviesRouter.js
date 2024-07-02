import express from "express";
import * as moviesController from "../Controllers/MoviesController.js";
import { protect, admin } from "../middlewares/Auth.js";
const router = express.Router();

//********** PUBLIC ROUTES ********//
router.post("/import", moviesController.importMovies);
router.get("/:id", moviesController.getMovieById);
router.get("/rated/top", moviesController.getTopRatedMovies);
router.get("/random/all", moviesController.getRandomMovies);

//********** PRIVATE ROUTES ********//

//********** ADMIN ROUTES ********//

export default router;
