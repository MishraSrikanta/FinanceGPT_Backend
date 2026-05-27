const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Income = require("../models/Income");
const Expences = require("../models/Expences");

const router = express.Router();

/* ================= REGISTER ================= */
router.post("/register", async (req, res) => {
  try {
    const { userId, name, email, phone, password } = req.body;

    if (!userId || !email || !password) {
      return res
        .status(400)
        .json({ message: "userId, email, and password are required" });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { userId }],
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      userId,
      name,
      email,
      phone,
      password: hashedPassword,
    });

    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= LOGIN ================= */
router.post("/login", async (req, res) => {
  try {
    console.log("Login attempt:", req.body);
    const { userId, password } = req.body;

    if (!userId || !password) {
      return res
        .status(400)
        .json({ message: "userId and password are required" });
    }

    const user = await User.findOne({ userId });
    console.log("User Details:", user);
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const decriptpass = bcrypt.decodeBase64(
      "$2b$10$81hFcmjiyQzdA0fY2IEY5eIx/BU7lzOfXleiFGHjVg2.JF0IqgvJm",
    );
    console.log("Decrypted Password:", decriptpass);

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password Match:", password, user.password, isMatch);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    const userUniqueId = user.userId;
    res.json({ token, user, userUniqueId });
  } catch (error) {
    console.error(error); // VERY IMPORTANT
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= Add  Income ================= */
router.post("/addIncome", async (req, res) => {
  try {
    const { parentId, userId, title, amount, source, date, description } =
      req.body;
    if (!userId || !title || !amount || !source || !date || !description) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const income = new Income({
      parentId,
      userId,
      title,
      amount,
      source,
      date,
      description,
    });
    await income.save();

    res.status(201).json({ message: "Income added successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/getIncome", async (req, res) => {
  try {
    const parentId = `${req.body.userId}`;

    if (!parentId) {
      return res.status(400).json({ message: "id is required" });
    }

    const incomes = await Income.find({ parentId });
    res.json({ incomes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/deleteIncome", async (req, res) => {
  try {
    const { parentId, userId } = req.body;

    if (!parentId || !userId) {
      return res.status(400).json({ message: "Income id is required" });
    }

    const deletedIncome = await Income.findOneAndDelete({ parentId, userId });

    if (!deletedIncome) {
      return res.status(404).json({ message: "Income not found" });
    }

    res.json({ message: "Income deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= Expenses ================= */
router.post("/addExpenses", async (req, res) => {
  try {
    const {
      parentId,
      id: userId,
      title,
      amount,
      category,
      date,
      description,
    } = req.body;
    console.log(
      "Add expenses",
      parentId,
      userId,
      title,
      amount,
      category,
      date,
      description,
    );
    if (
      !parentId ||
      !userId ||
      !title ||
      !amount ||
      !category ||
      !date ||
      !description
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const expense = new Expences({
      parentId,
      userId,
      title,
      amount,
      category,
      date,
      description,
    });
    await expense.save();

    res.status(201).json({ message: "Expense added successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/getExpenses", async (req, res) => {
  try {
    const parentId = `${req.body.userId}`;

    if (!parentId) {
      return res.status(400).json({ message: "id is required" });
    }

    const expenses = await Expences.find({ parentId });
    res.json({ expenses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/deleteExpenses", async (req, res) => {
  try {
    const { parentId, userId } = req.body;
    if (!parentId || !userId) {
      return res.status(400).json({ message: "Expense id is required" });
    }

    const deletedIncome = await Expences.findOneAndDelete({ parentId, userId });
    if (!deletedIncome) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});
module.exports = router;
