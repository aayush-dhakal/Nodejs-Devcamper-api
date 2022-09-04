const asyncHandler = require("../middleware/async");
const Bootcamp = require("../models/Bootcamp");
const ErroResponse = require("../utils/errorResponse");
const geocoder = require("../utils/geocoder");

// @desc Get all bootcamps
// @route Get /api/v1/bootcamps
// @access Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  let query;

  // copy req.query
  let reqQuery = { ...req.query };

  // Fields to exclude
  const removeFields = ["select", "sort", "page", "limit"];

  // Loop over removeFields and delete them from reqQuery
  removeFields.forEach((param) => delete reqQuery[param]);

  console.log(reqQuery);

  // create query string
  let queryStr = JSON.stringify(reqQuery); // converted to string to perfrom regex operation

  // using regex to put the $ sign in front of mongoose comparision operator, basically modifies the query {"averageCost":{"lte":"20000"}} into {"averageCost":{"$lte":"20000"}}
  // Using regex - \bcat\b will match the word cat but not the cat in scattered in the sentence: 'The cat scattered his food all over the room.'
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );

  // finding resource
  query = Bootcamp.find(JSON.parse(queryStr)); // parsing ie converting to json again for query operation

  // select fields
  if (req.query.select) {
    // we have to convert { selects: 'name,description' } into 'name description' for mongoose select query to execute
    const fields = req.query.select.split(",").join(" "); // split with comma to get array of select query values and then join those array elements with a space

    query = query.select(fields);
  }

  // sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");

    query = query.sort(sortBy);
  } else {
    // default descending sorting by createdAt date
    query = query.sort("-createdAt");
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1; // 10 is radix and 1 is default value
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Bootcamp.countDocuments();

  // initially we are on page 0 by default
  query = query.skip(startIndex).limit(limit);

  // executing query
  const bootcamps = await query;

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    pagination,
    data: bootcamps,
  });
});

// exports.getBootcamp = async (req, res, next) => {
//   try {
//     const bootcamp = await Bootcamp.findById(req.params.id);

//     // if the id is of correct format but there are no data associated with it then it will so null and a sucees. So we have to manually throw an error
//     if (!bootcamp) {
//       return next(
//         new ErroResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
//       );
//     }

//     res.status(200).json({
//       success: true,
//       data: bootcamp,
//     });
//   } catch (err) {
//     // when the id doesn't matches the format or data cannot be found
//     next(err);
//   }
// };

// @desc      Get single bootcamp
// @route     GET /api/v1/bootcamps/:id
// @access    Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  // if the id is of correct format but there are no data associated with it then it will so null and a sucees. So we have to manually throw an error
  if (!bootcamp) {
    return next(
      new ErroResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: bootcamp,
  });
});

// @desc      Create new bootcamp
// @route     POST /api/v1/bootcamps
// @access    Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.create(req.body);

  res.status(201).json({
    success: true,
    data: bootcamp,
  });
});

// @desc      Update bootcamp
// @route     PUT /api/v1/bootcamps/:id
// @access    Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // returns the newly modified data
    runValidators: true, // runs the validation on update as well
  });

  if (!bootcamp) {
    return next(
      new ErroResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: bootcamp,
  });
});

// @desc      Delete bootcamp
// @route     DELETE /api/v1/bootcamps/:id
// @access    Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

  if (!bootcamp) {
    return next(
      new ErroResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: bootcamp,
  });
});

// @desc      Get bootcamps within a radius
// @route     GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access    Private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  // Get lat/lng from geocoder
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  // Calc radius using radians
  // Divide dist by radius of Earth
  // Earth Radius = 3,963 mi / 6,378 km
  const radius = distance / 3963;

  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps,
  });
});
