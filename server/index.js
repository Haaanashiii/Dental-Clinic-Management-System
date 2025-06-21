require("dotenv").config();
require("express-async-errors");

const express = require("express");
const cors = require("cors");
const errorHandler = require("./middleware/errorHandler.js");

const userRoute = require("./routes/userRoute.js");
const dentistRoute = require("./routes/dentistRoute.js");
const staffRoute = require("./routes/staffRoute.js");
const recordRoute = require("./routes/recordRoute.js");
const appointmentRoute = require("./routes/appointmentRoute.js");
const UserRegistrationAndValidation = require("./routes/UserRegistrationAndValidationRoute.js");
const patientRoute = require("./routes/patientRoute.js");

const connectDB = require("./config/connection.js");

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Connect to MongoDB
connectDB();

//  Mount all routes
app.use("/user", userRoute);
app.use("/dentist", dentistRoute);
app.use("/staff", staffRoute);
app.use("/patient", patientRoute);
app.use("/appointment", appointmentRoute);
app.use("/record", recordRoute);
app.use("/auth", UserRegistrationAndValidation); 

// Error handler middleware
app.use(errorHandler);

// Start the server
const PORT = process.env.PORT || 1337;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://192.168.0.130:${PORT}`);
});

