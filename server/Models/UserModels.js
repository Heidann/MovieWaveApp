import mongoose from "mongoose";

const UserSchema = mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Please add a full name"],
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
      minlenght: [6, "Password must be at least 6 characters"],
    },
    image: {
      type: String,
      default: "https://www.gravatar.com/avatar/000?d=mp",
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    likedMovies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Movies",
      },
    ],
  },
  {
    timestamps: true, // this will add createdAt and updatedAt
  }
);
export default mongoose.model("User", UserSchema);
