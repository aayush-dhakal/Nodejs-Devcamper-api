const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const colors = require("colors");

const errorHandler = require("./middleware/error");

const connectDB = require("./config/db");

// Load environment variables. Import it at top as others are relying on it
// dotenv loads environment variables from .env into ENV (process.env)
dotenv.config({ path: "./config/config.env" });

// connect to database
connectDB();

// Route files
const bootcamps = require("./routes/bootcamps");
const courses = require("./routes/courses");

const app = express();

// Body parser(accepts the request body data as JSON)
app.use(express.json());

// development logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Mount routers
app.use("/api/v1/bootcamps", bootcamps);
app.use("/api/v1/courses", courses);

// make sure error handler is mounted at last ie after the api routes
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    `Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow
      .bold
  )
);

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  // The process object in Node.js is a global object that can be accessed inside any module without requiring it
  console.log(`Error: ${err.message}`.red);
  // Close server & exit process
  server.close(() => process.exit(1)); // 1 represent the exit with failure. 0 represents success
});
