const express = require("express");
const {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampsInRadius,
} = require("../controllers/bootcamps");

const router = express.Router();

// Include other resource routers
const courseRouter = require("./courses");

// Re-route into other resource routers
router.use("/:bootcampId/courses", courseRouter); // this will call /api/v1/courses routes and this parent parameter will be available to all of child router if they have mergeParams set to true

router.route("/radius/:zipcode/:distance").get(getBootcampsInRadius);

// if the url is /api/v1/bootcamp with get method then it will call the getBootcamp controller and if post method then createBootcamp
router.route("/").get(getBootcamps).post(createBootcamp);

router
  .route("/:id")
  .get(getBootcamp)
  .put(updateBootcamp)
  .delete(deleteBootcamp);

module.exports = router;
