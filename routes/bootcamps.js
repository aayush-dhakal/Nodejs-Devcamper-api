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

router.route("/radius/:zipcode/:distance").get(getBootcampsInRadius);

// if the url is /api/v1/bootcamp with get method then it will call the getBootcamp controller and if post method then createBootcamp
router.route("/").get(getBootcamps).post(createBootcamp);

router
  .route("/:id")
  .get(getBootcamp)
  .put(updateBootcamp)
  .delete(deleteBootcamp);

module.exports = router;
