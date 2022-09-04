const advancedResults = (model, populate) => async (req, res, next) => {
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
  query = model.find(JSON.parse(queryStr)); // parsing ie converting to json again for query operation

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
  const total = await model.countDocuments();

  // initially we are on page 0 by default
  query = query.skip(startIndex).limit(limit);

  // able to use populate cause of virtuals that are defined in the model
  if (populate) {
    query = query.populate(populate);
  }

  // executing query
  const results = await query;

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

  // any controller that has access to this advancedResults middleware will have access to this modified responsed object
  res.advancedResults = {
    success: true,
    count: results.length,
    pagination,
    data: results,
  };

  next();
};

module.exports = advancedResults;
