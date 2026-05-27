require("dotenv").config();


const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/auth");

const app = express();

/* MIDDLEWARE */
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ROUTES */
app.use("/api/auth", authRoutes);

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