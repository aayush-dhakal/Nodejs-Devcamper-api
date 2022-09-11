const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, "Please add a course title"],
  },
  description: {
    type: String,
    required: [true, "Please add a description"],
  },
  weeks: {
    type: String,
    required: [true, "Please add number of weeks"],
  },
  tuition: {
    type: Number,
    required: [true, "Please add a tuition cost"],
  },
  minimumSkill: {
    type: String,
    required: [true, "Please add a minimum skill"],
    enum: ["beginner", "intermediate", "advanced"],
  },
  scholarshipAvailable: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: "Bootcamp",
    required: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
});

// In mongoose there are static methods and the general methods.
// The static methods are called on the model itself
// Eg: suppose we are in controller then to call static method then we call on model(model name is in capital) like Course.goFish()
// Whereas the general method is called on the query of the model
// Eg: const courses=Course.find()
// courses.goFish()

// Static method to get average of course tuitions
// Get the average tutition cost of all the courses for a specific bootcamp and populate that averageCost filed in bootcamp model. So now whenever you fetch all the bootcamps you will also get the averageCost field in the response
CourseSchema.statics.getAverageCost = async function (bootcampId) {
  // obj returns an array with field like [{ _id: new ObjectId("5d725a1b7b292f5f8ceff788"), averageCost: 10000 }]
  const obj = await this.aggregate([
    {
      $match: { bootcamp: bootcampId }, // finds the filed to run the aggragation. Here we find it by bootcamp's id
    },
    {
      $group: {
        // $ is cumpulsory to access the fields of model
        _id: "$bootcamp", // in group we first include the bootcamp id. This is compulsory
        averageCost: { $avg: "$tuition" }, // here tution is the filed whose average is to be calculated
      },
    },
  ]);

  // save the average cost into Bootcamp model
  try {
    await this.model("Bootcamp").findByIdAndUpdate(bootcampId, {
      averageCost: Math.ceil(obj[0].averageCost / 10) * 10,
    });
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageCost after save
CourseSchema.post("save", function () {
  this.constructor.getAverageCost(this.bootcamp);
});

// Call getAverageCost before remove
CourseSchema.pre("remove", function () {
  this.constructor.getAverageCost(this.bootcamp);
});

module.exports = mongoose.model("Course", CourseSchema);
