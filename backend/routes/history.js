const express = require("express");

const router = express.Router();

const authenticateToken = require("../middleware/authMiddleware");

const {
  getRecentDiabetesPredictions
} = require("../models/diabetesPrediction");

const {
  getUserHeartPredictions
} = require("../models/heartPrediction");


// ==========================================
// DIABETES HISTORY
// ==========================================

router.get(
  "/diabetes",
  authenticateToken,
  async (req, res) => {

    try {

      const history =
        await getRecentDiabetesPredictions(
          req.user.id,
          20
        );

      res.json(history);

    } catch (err) {

      console.error(
        "Diabetes history error:",
        err.message
      );

      res.status(500).json({
        error: "Failed to fetch diabetes history"
      });

    }

  }
);


// ==========================================
// HEART HISTORY
// ==========================================

router.get(
  "/heart",
  authenticateToken,
  async (req, res) => {

    try {

      const history =
        await getUserHeartPredictions(
          req.user.id,
          20
        );

      res.json(history);

    } catch (err) {

      console.error(
        "Heart history error:",
        err.message
      );

      res.status(500).json({
        error: "Failed to fetch heart history"
      });

    }

  }
);


module.exports = router;