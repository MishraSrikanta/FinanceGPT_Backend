require("dotenv").config();


const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const { resolveUser } = require("./middleware/user");
const authRoutes = require("./routes/auth");
const { router: salaryRoutes } = require("./routes/salary");
const taxRoutes = require("./routes/tax");
const emiRoutes = require("./routes/emis");
const fdRoutes = require("./routes/fds");
const dashboardRoutes = require("./routes/dashboard");
const { router: secondaryIncomeRoutes } = require("./routes/secondaryIncome");
const settingsRoutes = require("./routes/settings");
const sipRoutes = require("./routes/sips");
const { router: policyRoutes } = require("./routes/policies");

const app = express();

/* MIDDLEWARE */
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-user-id"],
}));
/* Answer any preflight (OPTIONS) request with the same CORS policy */
app.options(/.*/, cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(resolveUser);

/* ROUTES */
app.use("/api/auth", authRoutes);
app.use("/api/salary", salaryRoutes);
app.use("/api/tax", taxRoutes);
app.use("/api/emis", emiRoutes);
app.use("/api/fds", fdRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/secondary-income", secondaryIncomeRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/sips", sipRoutes);
app.use("/api/policies", policyRoutes);

/* CONNECT DATABASE */
mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log("MongoDB Connected");
  const PORT = 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})
.catch(err => console.log(err));

app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});