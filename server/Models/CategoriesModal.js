import mongoose from "mongoose";

const CategoriesSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: [50, "Title can not be more than 50 characters"],
    },
  },
  {
    timestamps: true,
  }
);
export default mongoose.model("Categories", CategoriesSchema);
