require("dotenv").config();
require("express-async-errors");

const express = require("express");
const cors = require("cors");
const os = require("os");

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

// Mount routes
app.use("/user", userRoute);
app.use("/dentist", dentistRoute);
app.use("/staff", staffRoute);
app.use("/patient", patientRoute);
app.use("/appointment", appointmentRoute);
app.use("/record", recordRoute);
app.use("/auth", UserRegistrationAndValidation);

// Error handler
app.use(errorHandler);

// Function to get local LAN IP
function getLocalIP() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === "IPv4" && !net.internal) {
        return net.address;
      }
    }
  }
  return "localhost";
}

// Start server
const PORT = process.env.PORT || 1337;
const IP = getLocalIP();

app.listen(PORT, '0.0.0.0', () => {
  console.log(` Server running at:`);
  console.log(`    Local:    http://localhost:${PORT}`);
  console.log(`    Network:  http://${IP}:${PORT}`);
});
  