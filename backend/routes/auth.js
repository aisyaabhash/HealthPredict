const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();

const {
  createUser,
  findUserByUsername
} = require("../models/user");

require("dotenv").config();


// ==========================================
// SIGNUP
// ==========================================

router.post("/signup", async (req, res) => {
  try {
    const {
      username,
      password,
      confirmPassword
    } = req.body;

    // Check required fields
    if (!username || !password || !confirmPassword) {
      return res.status(400).json({
        error: "All fields are required"
      });
    }

    // Trim username
    const cleanUsername = username.trim();

    if (cleanUsername.length < 3) {
      return res.status(400).json({
        error: "Username must be at least 3 characters"
      });
    }

    // Password confirmation
    if (password !== confirmPassword) {
      return res.status(400).json({
        error: "Passwords do not match"
      });
    }

    // Password length
    if (password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters"
      });
    }

    // Check duplicate username
    const existingUser = await findUserByUsername(cleanUsername);

    if (existingUser) {
      return res.status(409).json({
        error: "Username already taken"
      });
    }

    // Create user
    const userId = await createUser(
      cleanUsername,
      password
    );

    return res.status(201).json({
      message: "User created successfully",
      userId
    });

  } catch (err) {
    console.error("Signup error:", err);

    return res.status(500).json({
      error: "Signup failed"
    });
  }
});


// ==========================================
// LOGIN
// ==========================================

router.post("/login", async (req, res) => {
  try {
    const {
      username,
      password
    } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        error: "Username and password are required"
      });
    }

    const user = await findUserByUsername(
      username.trim()
    );

    if (!user) {
      return res.status(401).json({
        error: "Invalid username or password"
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatch) {
      return res.status(401).json({
        error: "Invalid username or password"
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "2h"
      }
    );

    return res.json({
      message: "Login successful",
      token,
      username: user.username,
      userId: user.id
    });

  } catch (err) {
    console.error("Login error:", err);

    return res.status(500).json({
      error: "Login failed"
    });
  }
});


module.exports = router;