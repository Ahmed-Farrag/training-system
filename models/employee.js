const mongoose = require("mongoose");
const Joi = require("joi");
const autoencrement = require("mongoose-sequence")(mongoose);
const cities = require("full-countries-cities").getCities("egypt");
const validator = require('validator');
const jwt = require("jsonwebtoken");
const config = require("config");

const empolyeesSchema = mongoose
  .Schema(
    {
      fullNameArabic: {
        type: String,
        required: true,
        trim: true,
        maxlength: 255,
        minlength: 3,
      },
      fullNameEnglish: {
        type: String,
        required: true,
        trim: true,
        maxlength: 255,
        minlength: 3,
        lowercase: true,
      },
      nationalID: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        maxlength: 14,
      },
      homeTel: {
        type: String,
        trim: true,
        unique: true,
        maxlength: 10,
      },
      mobile1: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        maxlength: 11,
        validate: {
          validator: (value) => validator.isMobilePhone(value, "ar-EG"),
          messege: "the mobile1 is not correct",
        },
      },
      mobile2: {
        type: String,
        trim: true,
        unique: true,
        maxlength: 11,
        validate: {
          validator: (value) => validator.isMobilePhone(value, "ar-EG"),
          messege: "the mobile2 is not correct",
        },
      },
      email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        maxlength: 255,
        minlength: 3,
        validate: {
          validator: (value) => validator.isEmail(value),
          messege: "the email is not correct",
        },
      },
      gender: {
        type: String,
        required: true,
        enum: ["male", "female"],
        lowercase: true,
        trim: true,
      },
      city: {
        type: String,
        required: true,
        enum: cities,
        trim: true,
      },
      address: {
        type: String,
        required: true,
        trim: true,
        maxlength: 255,
        minlength: 5,
        lowercase: true,
      },
      branchID: {
        type: mongoose.Schema.Types.Number,
        ref: "branch",
        required: true,
        trim: true,
      },
      // $ securty
      password: {
        type: String,
        required: true,
        trim: true,
        minlength: 4,
        maxlength: 1024, // to any one open db can't read password
      },
      // Authorization
      role: {
        type: String,
        enum: ["admin", "manager"],
        default: "manager",
      },
    },
    { timestamps: true }
  )
  .plugin(autoencrement, { inc_field: "employeeID" });

empolyeesSchema.methods.generateToken = function () {
  //JWT = json web token
  const token = jwt.sign(
    { _id: this._id, email: this.email },
    config.get("jwtprivatekey")
  );
  return token;
};

const Employee = mongoose.model("employees", empolyeesSchema);

// function validationEmployee(emploee) {
const Schema = Joi.object({
  fullNameArabic: Joi.string().required().max(255).min(3).trim(),
  fullNameEnglish: Joi.string().required().max(255).min(3).trim(),
  nationalID: Joi.string()
    .regex(/^([0-9]*)$/, { name: "numbers" })
    .length(14)
    .required()
    .trim(),
  homeTel: Joi.string()
    .regex(/^([0-9]*)$/, { name: "numbers" })
    .length(10)
    .trim(),
  mobile1: Joi.string()
    .regex(/^([0-9]*)$/, { name: "numbers" })
    .length(11)
    .required()
    .trim(),
  mobile2: Joi.string()
    .regex(/^([0-9]*)$/, { name: "numbers" })
    .length(11)
    .trim(),
  email: Joi.string().email({ minDomainSegments: 2 }).trim(),
  gender: Joi.string().required().lowercase().valid("male", "female").trim(),
  city: Joi.string()
    .required()
    .valid(...cities)
    .trim(),
  address: Joi.string().required().max(255).min(5).trim(),
  branchID: Joi.number().required(),
  role: Joi.string().valid("admin", "manager"),
  password: Joi.string()
    .required()
    .regex(/^([a-z0-9A-Z]*)$/),
});
//   return schema.validate(emploee);
// }

exports.Employee = Employee;
// exports.validate = validationEmployee;
exports.Schema = Schema;
