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

//***** PRIVATE CONTROLLERS *****/

// @desc Create movie review
// @route POST /api/movies/:id/reviews
// @access Private
const createMovieReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  try {
    // find movie by id
    const movie = await Movie.findById(req.params.id);

    // if the movie is found
    if (movie) {
      // check if user already reviewed this movie
      const alreadyReviewed = await movie.reviews.find(
        (review) => review.userId.toString() === req.user._id.toString()
      );

      // if the user already reviewed this movie send 400 error
      if (alreadyReviewed) {
        res.status(400);
        throw new Error("User already reviewed this movie");
      }
      // else create new review
      const review = {
        userId: req.user._id,
        userName: req.user.fullName,
        userImage: req.body.image,
        rating: Number(rating),
        comment,
      };

      // push the new review to the review array
      movie.reviews.push(review);

      // increment the number of reviews
      movie.numberOfReviews = movie.reviews.length;

      // calculate the new rate
      movie.rate =
        movie.reviews.reduce((acc, item) => item.rating + acc, 0) /
        movie.reviews.length;

      // save movie in the database
      await movie.save();

      // send movie to the client
      res.status(201).json({ message: "Review added successfully" }, { movie });
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

export {
  importMovies,
  getMovies,
  getMovieById,
  getTopRatedMovies,
  getRandomMovies,
  createMovieReview,
};
