const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const colors = require("colors");
const fileupload = require("express-fileupload");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const cors = require("cors");

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
const auth = require("./routes/auth");
const users = require("./routes/users");
const reviews = require("./routes/reviews");

const app = express();

// Body parser(accepts the request body data as JSON)
app.use(express.json());

// Cookie parser middleware
app.use(cookieParser());

// development logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// File uploading
app.use(fileupload());

// Sanitize data
app.use(mongoSanitize()); // basically stops the usage of special mongo db operators like $gt

// Set security headers
app.use(helmet());

// Prevent XSS attacks
app.use(xss()); // prevents the insertion of html tags. Like it converts <script> into &lt;script>

// Rate limiting
const limiter = rateLimit({
  // 100 requests per 10 minutes are allowed
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100,
});
app.use(limiter);

// Prevent http param pollution
app.use(hpp());

// Enable CORS
app.use(cors()); // it makes the api available in all origins ie public

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

// Mount routers
app.use("/api/v1/bootcamps", bootcamps);
app.use("/api/v1/courses", courses);
app.use("/api/v1/auth", auth);
app.use("/api/v1/users", users);
app.use("/api/v1/reviews", reviews);

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
