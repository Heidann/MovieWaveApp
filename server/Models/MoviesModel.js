import mongoose from "mongoose";
const reviewSchema = mongoose.Schema(
  {
    userName: {
      type: String,
      required: [true, "Please add a name"],
    },
    userImage: {
      type: String,
      required: [true, "Please add an image"],
    },
    rating: {
      type: String,
      required: [true, "Please add a rating"],
    },
    comment: {
      type: String,
      required: [true, "Please add a comment"],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please add a user"],
    },
  },
  {
    timestamps: true,
  }
);
const moviesSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    name: {
      type: String,
      required: [true, "Please add a title"],
    },
    desc: {
      type: String,
      required: [true, "Please add a description"],
    },
    titleImage: {
      type: String,
      default: "https://www.gravatar.com/avatar/000?d=mp",
    },
    image: {
      type: String,
      default: "https://www.gravatar.com/avatar/000?d=mp",
    },
    category: {
      type: String,
      required: [true, "Please add a category"],
    },
    language: {
      type: String,
      required: [true, "Please add a language"],
    },
    year: {
      type: Number,
      required: [true, "Please add a year"],
    },
    time: {
      type: Number,
      required: [true, "Please add a time"],
    },
    video: {
      type: String,
      // required: [true, "Please add a video"],
    },
    rate: {
      type: Number,
      required: [true, "Please add a rating"],
      default: 0,
    },
    numberOfReviews: {
      type: Number,
      required: [true, "Please add a number of reviews"],
      default: 0,
    },
    reviews: [reviewSchema],
    casts: [
      {
        name: {
          type: String,
          required: [true, "Please add a name"],
        },
        image: {
          type: String,
          required: [true, "Please add an image"],
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Movies", moviesSchema);
