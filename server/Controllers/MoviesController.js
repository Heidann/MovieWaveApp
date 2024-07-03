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
    const limit = 4; // quantity movies per page
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

//***** ADMIN CONTROLLERS *****/

// @desc Update movie
// @route PUT /api/movies/:id
// @access Private/Admin
const updateMovie = asyncHandler(async (req, res) => {
  const {
    name,
    desc,
    image,
    titleImage,
    rate,
    numberOfReviews,
    category,
    time,
    language,
    year,
    video,
    casts,
  } = req.body;
  try {
    // find movie by id
    const movie = await Movie.findById(req.params.id);
    // if the movie is found
    if (movie) {
      // update movie data
      movie.name = name || movie.name;
      movie.desc = desc || movie.desc;
      movie.image = image || movie.image;
      movie.titleImage = titleImage || movie.titleImage;
      movie.rate = rate || movie.rate;
      movie.numberOfReviews = numberOfReviews || movie.numberOfReviews;
      movie.category = category || movie.category;
      movie.time = time || movie.time;
      movie.language = language || movie.language;
      movie.year = year || movie.year;
      movie.video = video || movie.video;
      movie.casts = casts || movie.casts;

      // save movie in the database
      const updatedMovie = await movie.save();

      // send the update movie to the client
      res
        .status(201)
        .json({ message: "Movie updated successfully" }, { updatedMovie });

      // if the movie is not found send 404 error message
    } else {
      res.status(404);
      throw new Error("Movie not found");
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc Delete movie
// @route DELETE /api/movies/:id
// @access Private/Admin
const deleteMovie = asyncHandler(async (req, res) => {
  try {
    // find movie by id and delete it
    const movie = await Movie.findById(req.params.id);
    // if the movie is found and delete it
    if (movie) {
      // delete movie from the database
      await movie.deleteOne();
      // send message to the client
      res.status(201).json({ message: "Movie deleted successfully" });
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

// @desc Delete all movie
// @route DELETE /api/movies
// @access Private/Admin
const deleteAllMovies = asyncHandler(async (req, res) => {
  try {
    // delete all movies from the database
    await Movie.deleteMany({});
    // send message to the client
    res.status(201).json({ message: "All movies deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc Create movie
// @route POST /api/movies
// @access Private/Admin
const createMovie = asyncHandler(async (req, res) => {
  const {
    name,
    desc,
    image,
    titleImage,
    rate,
    numberOfReviews,
    category,
    time,
    language,
    year,
    video,
    casts,
  } = req.body;
  try {
    // create a new movie
    const movie = new Movie({
      userId: req.user._id,
      name,
      desc,
      image,
      titleImage,
      rate,
      numberOfReviews,
      category,
      time,
      language,
      year,
      video,
      casts,
    });

    // save movie in the database
    if (movie) {
      const createdMovie = await movie.save();
      res.status(201).json(createdMovie);
    } else {
      res.status(400);
      throw new Error("Invalid movie data");
    }

    // send the created movie to the client
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
  updateMovie,
  deleteMovie,
  deleteAllMovies,
  createMovie,
};
