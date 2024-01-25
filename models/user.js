const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const yup = require("yup");

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
});

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign({ _id: this._id }, process.env.JWTPRIVATEKEY, {
    expiresIn: "7d",
  });
  return token;
};

const User = mongoose.model("user", userSchema);

const validate = async (data) => {
  const schema = yup.object({
    firstName: yup.string().required().label("First Name"),
    lastName: yup.string().required().label("Last Name"),
    email: yup.string().email().required().label("Email"),
    password: yup
      .string()
      .required()
      .label("Password")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        "Password must meet complexity requirements"
      ),
  });

  try {
    await schema.validate(data, { abortEarly: false });
    return { error: null, value: data };
  } catch (error) {
    return { error, value: null };
  }
};

module.exports = { User, validate };