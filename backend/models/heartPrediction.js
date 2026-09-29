const { pool } = require("./init");


// ==========================================
// SAVE HEART PREDICTION
// ==========================================

async function saveHeartPrediction(data) {

  const {
    user_id,
    gender,
    age,
    chest_pain,
    resting_bp,
    cholesterol,
    fasting_blood_sugar,
    max_heart_rate,
    exercise_angina,
    oldpeak,
    prediction,
    probability,
    risk_level
  } = data;

  const [result] = await pool.query(
    `
    INSERT INTO heart_predictions
    (
      user_id,
      gender,
      age,
      chest_pain,
      resting_bp,
      cholesterol,
      fasting_blood_sugar,
      max_heart_rate,
      exercise_angina,
      oldpeak,
      prediction,
      probability,
      risk_level
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      user_id,
      gender,
      age,
      chest_pain,
      resting_bp,
      cholesterol,
      fasting_blood_sugar,
      max_heart_rate,
      exercise_angina,
      oldpeak,
      prediction,
      probability,
      risk_level
    ]
  );

  return result.insertId;
}


// ==========================================
// GET USER HEART HISTORY
// ==========================================

async function getUserHeartPredictions(
  userId,
  limit = 20
) {

  const [rows] = await pool.query(
    `
    SELECT *
    FROM heart_predictions
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT ?
    `,
    [userId, limit]
  );

  return rows;
}


module.exports = {
  saveHeartPrediction,
  getUserHeartPredictions
};