const express = require("express");
const {
  getCourses,
  getCourse,
  addCourse,
  updateCourse,
  deleteCourse,
} = require("../controllers/courses");
const { protect, authorize } = require("../middleware/auth");

const Course = require("../models/Course");
const advancedResults = require("../middleware/advancedResults");

// You must pass {mergeParams: true} to the child router if you want to access the params from the parent router
const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(
    advancedResults(Course, {
      // this second option is for populate
      path: "bootcamp",
      select: "name description", // adds the name and description from the associated bootcamp model
    }),
    getCourses
  )
  .post(protect, authorize("publisher", "admin"), addCourse);
router
  .route("/:id")
  .get(getCourse)
  .put(protect, authorize("publisher", "admin"), updateCourse)
  .delete(protect, authorize("publisher", "admin"), deleteCourse);

module.exports = router;
