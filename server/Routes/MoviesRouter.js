import express from "express";
import { importMovies, getMovies } from "../Controllers/MoviesController.js";
import { protect, admin } from "../middlewares/Auth.js";
const router = express.Router();

//********** PUBLIC ROUTES ********//
router.post("/import", importMovies);
router.get("/", getMovies);

//********** PRIVATE ROUTES ********//

//********** ADMIN ROUTES ********//

export default router;
