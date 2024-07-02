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

// @decs get all movies
// @route GET /api/movies
// @access Public
const getMovies = asyncHandler(async (req, res) => {
  try {
    // filter movies by catefory, time language, rate, year and search
    const { category, time, language, rate, year, search } = req.query;
    let query = {
      ...(category && { category }),
      ...(time && { time }),
      ...(language && { language }),
      ...(rate && { rate }),
      ...(year && { year }),
      ...(search && { name: { $regex: search, $options: "i" } }),
    };
    //  load more movies functionality
    const page = Number(req.query.pageNumber) || 1; // if pageNumber is not provided in query we set it to 1
    const limit = 2; // 2 movies per page
    const skip = (page - 1) * limit; // skip movies by page number

    // find movies by query , skip and limit
    const movies = await Movie.find(query)
      .sort({ createAt: -1 })
      .skip(skip)
      .limit(limit);

    // get total number of movies
    const count = await Movie.countDocuments(query);

    // send response with movies and total number of movies
    res.status(200).json({
      movies,
      page,
      pages: Math.ceil(count / limit), // total number of pages
      totalMovies: count, // total number of movies
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @decs get movie by id
// @route GET /api/movies/:id
// @access Public
const getMovieById = asyncHandler(async (req, res) => {
  try {
    // find movie by id
    const movie = await Movie.findById(req.params.id);
    // if the movie is found send it to the client
    if (movie) {
      res.status(200).json(movie);
    }
    // if the movie is not found send 404 error message
    else {
      res.status(404);
      throw new Error("Movie not found");
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc Get top rated movies
// @route GET /api/movies/rated/top
// @access Public
const getTopRatedMovies = asyncHandler(async (req, res) => {
  try {
    // find top rated movies
    const movies = await Movie.find({}).sort({ rate: -1 }); // sort by rating
    // send top rated movies to the client
    res.json(movies);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc Get random movies
// @route GET /api/movies/random/all
// @access Public
const getRandomMovies = asyncHandler(async (req, res) => {
  try {
    // find random movies
    const movies = await Movie.aggregate([{ $sample: { size: 8 } }]); // aggregate all movies with size 8
    // send random movies to the client
    res.json(movies);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export {
  importMovies,
  getMovies,
  getMovieById,
  getTopRatedMovies,
  getRandomMovies,
};
