const { pool } = require("./init");


// ==========================================
// SAVE DIABETES PREDICTION
// ==========================================

async function saveDiabetesPrediction(data) {

  const {
    user_id,
    gender,
    age,
    pregnancies,
    glucose,
    blood_pressure,
    skin_thickness,
    insulin,
    bmi,
    diabetes_pedigree,
    prediction,
    probability,
    risk_level
  } = data;

  const [result] = await pool.query(

    `INSERT INTO diabetes_predictions
    (
      user_id,
      gender,
      age,
      pregnancies,
      glucose,
      blood_pressure,
      skin_thickness,
      insulin,
      bmi,
      diabetes_pedigree,
      prediction,
      probability,
      risk_level
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,

    [
      user_id,
      gender,
      age,
      pregnancies,
      glucose,
      blood_pressure,
      skin_thickness,
      insulin,
      bmi,
      diabetes_pedigree,
      prediction,
      probability,
      risk_level
    ]

  );

  return result.insertId;
}


// ==========================================
// GET USER DIABETES HISTORY
// ==========================================

async function getRecentDiabetesPredictions(
  user_id,
  limit = 20
) {

  const [rows] = await pool.query(

    `SELECT *
     FROM diabetes_predictions
     WHERE user_id = ?
     ORDER BY created_at DESC
     LIMIT ?`,

    [
      user_id,
      limit
    ]

  );

  return rows;
}


module.exports = {
  saveDiabetesPrediction,
  getRecentDiabetesPredictions
};