const express = require("express");
const {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampsInRadius,
  bootcampPhotoUpload,
} = require("../controllers/bootcamps");
const Bootcamp = require("../models/Bootcamp");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// Include other resource routers
const courseRouter = require("./courses");

const advancedResults = require("../middleware/advancedResults");

// Re-route into other resource routers
router.use("/:bootcampId/courses", courseRouter); // this will call /api/v1/courses routes and this parent parameter will be available to all of child router if they have mergeParams set to true

router.route("/radius/:zipcode/:distance").get(getBootcampsInRadius);

router
  .route("/:id/photo")
  .put(protect, authorize("publisher", "admin"), bootcampPhotoUpload); // make sure to put authorize middleware after protect because it depends on the req.user set by protect middleware

// if the url is /api/v1/bootcamp with get method then it will call the getBootcamp controller and if post method then createBootcamp
router
  .route("/")
  .get(advancedResults(Bootcamp, "courses"), getBootcamps)
  .post(protect, authorize("publisher", "admin"), createBootcamp);

router
  .route("/:id")
  .get(getBootcamp)
  .put(protect, authorize("publisher", "admin"), updateBootcamp)
  .delete(protect, authorize("publisher", "admin"), deleteBootcamp);

module.exports = router;
