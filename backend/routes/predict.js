const express = require("express");
const axios = require("axios");

const router = express.Router();

const authenticateToken = require("../middleware/authMiddleware");

const {
  saveDiabetesPrediction
} = require("../models/diabetesPrediction");

const {
  saveHeartPrediction
} = require("../models/heartPrediction");

require("dotenv").config();


// ==========================================
// DIABETES PREDICTION
// ==========================================

router.post(
  "/diabetes",
  authenticateToken,
  async (req, res) => {

    try {

      const inputData = req.body;

      // Send data to Flask ML API
      const flaskResponse = await axios.post(
        process.env.FLASK_DIABETES_URL,
        inputData
      );

      const {
        prediction,
        probability,
        risk_level
      } = flaskResponse.data;


      // Save prediction to MySQL
      const predictionId =
        await saveDiabetesPrediction({

          user_id: req.user.id,

          gender: inputData.Gender,

          age: inputData.Age,

          pregnancies:
            inputData.Pregnancies || 0,

          glucose:
            inputData.Glucose,

          blood_pressure:
            inputData.BloodPressure,

          skin_thickness:
            inputData.SkinThickness,

          insulin:
            inputData.Insulin,

          bmi:
            inputData.BMI,

          diabetes_pedigree:
            inputData.DiabetesPedigreeFunction,

          prediction,

          probability,

          risk_level
        });


      return res.json({

        id: predictionId,

        prediction,

        probability,

        risk_level

      });

    } catch (err) {

      console.error(
        "Diabetes prediction error:",
        err.message
      );

      // If Flask returned an error
      if (err.response) {

        return res.status(
          err.response.status || 500
        ).json({

          error:
            err.response.data?.error ||
            "Diabetes prediction failed"

        });

      }

      return res.status(500).json({

        error: "Diabetes prediction failed"

      });

    }

  }
);


// ==========================================
// HEART PREDICTION
// ==========================================

router.post(
  "/heart",
  authenticateToken,
  async (req, res) => {

    try {

      const inputData = req.body;


      // Send data to Flask ML API
      const flaskResponse = await axios.post(
        process.env.FLASK_HEART_URL,
        inputData
      );


      const {
        prediction,
        probability,
        risk_level
      } = flaskResponse.data;


      // Save prediction to MySQL
      const predictionId =
        await saveHeartPrediction({

          user_id: req.user.id,

          gender: inputData.Gender,

          age: inputData.Age,

          chest_pain:
            inputData.ChestPain,

          resting_bp:
            inputData.RestingBP,

          cholesterol:
            inputData.Cholesterol,

          fasting_blood_sugar:
            inputData.FastingBloodSugar,

          max_heart_rate:
            inputData.MaxHeartRate,

          exercise_angina:
            inputData.ExerciseAngina,

          oldpeak:
            inputData.Oldpeak,

          prediction,

          probability,

          risk_level
        });


      return res.json({

        id: predictionId,

        prediction,

        probability,

        risk_level

      });

    } catch (err) {

      console.error(
        "Heart prediction error:",
        err.message
      );


      // If Flask returned an error
      if (err.response) {

        return res.status(
          err.response.status || 500
        ).json({

          error:
            err.response.data?.error ||
            "Heart prediction failed"

        });

      }


      return res.status(500).json({

        error: "Heart prediction failed"

      });

    }

  }
);


module.exports = router;