import Categories from "../Models/CategoriesModal.js";
import asyncHandler from "express-async-handler";

//***** PUBLIC CONTROLLERS *****/

// @desc Get all categories
// @route GET /api/categories
// @access Public
const getCategories = asyncHandler(async (req, res) => {
  try {
    // find all categories in DB
    const categories = await Categories.find({});
    // send all categories to the client
    res.json(categories);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//***** ADMIN CONTROLLERS *****/

// @desc Create a new category
// @route POST /api/categories
// @access Private/Admin
const createCategory = asyncHandler(async (req, res) => {
  try {
    // get title from request body
    const { title } = req.body;
    // create a new category
    const category = new Categories({ title });
    // save category in DB
    await category.save();
    // send the new category to the client
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc Update category
// @route PUT /api/categories/:id
// @access Private/Admin
const updateCategory = asyncHandler(async (req, res) => {
  const { title } = req.body;
  try {
    // find category by id and update it
    const category = await Categories.findById(req.params.id);
    if (category) {
      // update category title
      category.title = title || category.title;
      // save updated category in DB
      await category.save();
      // send updated category to the client
      res.status(201).json(category);
    } else {
      res.status(404).json({ message: "Category not found" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc Delete category
// @route DELETE /api/categories/:id
// @access Private/Admin
const deleteCategory = asyncHandler(async (req, res) => {
  try {
    // find category in DB
    const category = await Categories.findById(req.params.id);
    // if category exits delete category from DB
    if (category) {
      // delete  the category from DB
      await category.deleteOne();
      // send message to the client
      res.status(201).json({ message: "Category deleted" });
    } else {
      res.status(404).json({ message: "Category not found" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export { getCategories, createCategory, updateCategory, deleteCategory };
