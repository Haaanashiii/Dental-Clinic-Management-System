require("dotenv").config();
require("express-async-errors");

const express = require("express");
const cors = require("cors");

const errorHandler = require("./middleware/errorHandler.js");

const dentistRoute = require("./routes/dentistRoute.js");
const staffRoute = require("./routes/staffRoute.js");
const recordRoute = require("./routes/recordRoute.js");
const appointmentRoute = require("./routes/appointmentRoute.js");
const UserRegistrationAndValidation = require("./routes/UserRegistrationAndValidationRoute.js");
const patientRoute = require("./routes/patientRoute.js");
const otpRoute = require("./routes/otpRoute.js");

const auditRoute = require("./routes/auditRoute.js");

const connectDB = require("./config/connection.js");

const app = express();

const frontendUrl = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.trim() : "";
const localOriginPattern = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

// Middleware
app.use(cors({
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    if (frontendUrl && origin === frontendUrl) {
      return callback(null, true);
    }

    if (localOriginPattern.test(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: false,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Connect to MongoDB
connectDB();

// Mount routes
app.use("/dentist", dentistRoute);
app.use("/staff", staffRoute);
app.use("/patient", patientRoute);
app.use("/appointment", appointmentRoute);
app.use("/record", recordRoute);
app.use("/auth", UserRegistrationAndValidation);
app.use("/otp", otpRoute);
app.use("/audit", auditRoute);

// Error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5137;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
