import asyncHandler from "express-async-handler"; // to handle errors in async routes
import Movie from "../Models/MoviesModel.js";
import { MoviesData } from "../Data/MovieData.js";
//***** PUBLIC CONTROLLERS *****/
// @decs import movies
// @route POST /api/movies/import
// @access Public
const importMovies = asyncHandler(async (req, res) => {
  // first we make sure our Movies table is emty by delete all documents
  await Movie.deleteMany({});
  // then we insert our Movies from the MoviesData
  const movies = await Movie.insertMany(MoviesData);
  res.status(201).json({ movies });
});
export { importMovies };
