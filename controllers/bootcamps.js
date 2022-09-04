const asyncHandler = require("../middleware/async");
const Bootcamp = require("../models/Bootcamp");
const ErroResponse = require("../utils/errorResponse");

// @desc Get all bootcamps
// @route Get /api/v1/bootcamps
// @access Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  const bootcamps = await Bootcamp.find();

  res.status(200).json({
    success: true,
    count: bootcamps.length,
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

exports.createBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.create(req.body);

  res.status(201).json({
    success: true,
    data: bootcamp,
  });
});

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
