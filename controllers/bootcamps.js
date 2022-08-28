// @desc Get all bootcamps
// @route Get /api/v1/bootcamps
// @access Public
exports.getBootcamps = (req, res, next) => {
  res.status(200).json({ success: true, msg: "show all bootcamps" });
};

exports.getBootcamp = (req, res, next) => {
  res.status(200).json({ success: true, msg: "show a bootcamps" });
};

exports.createBootcamp = (req, res, next) => {
  res.status(200).json({ success: true, msg: "create a bootcamps" });
};

exports.updateBootcamp = (req, res, next) => {
  res.status(200).json({ success: true, msg: "update a bootcamps" });
};

exports.deleteBootcamp = (req, res, next) => {
  res.status(200).json({ success: true, msg: "delete a bootcamps" });
};
