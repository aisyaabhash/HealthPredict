const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10
});

async function ensureColumn(table, column, definition) {
  const [rows] = await pool.query(
    `
    SELECT COUNT(*) AS count
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = ?
      AND column_name = ?
    `,
    [table, column]
  );

  if (rows[0].count === 0) {
    await pool.query(
      `ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`
    );

    console.log(`Added column ${table}.${column}`);
  }
}

async function initDb() {
  // ---------------- USERS ----------------

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ---------------- DIABETES ----------------

  await pool.query(`
    CREATE TABLE IF NOT EXISTS diabetes_predictions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      gender ENUM('Male','Female','Other'),
      age INT,
      pregnancies INT,
      glucose FLOAT,
      blood_pressure FLOAT,
      skin_thickness FLOAT,
      insulin FLOAT,
      bmi FLOAT,
      diabetes_pedigree FLOAT,
      prediction VARCHAR(30),
      probability FLOAT,
      risk_level VARCHAR(20),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ---------------- HEART ----------------

  await pool.query(`
    CREATE TABLE IF NOT EXISTS heart_predictions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      gender ENUM('Male','Female','Other'),
      age INT,
      chest_pain INT,
      resting_bp FLOAT,
      cholesterol FLOAT,
      fasting_blood_sugar FLOAT,
      max_heart_rate FLOAT,
      exercise_angina VARCHAR(5),
      oldpeak FLOAT,
      prediction VARCHAR(30),
      probability FLOAT,
      risk_level VARCHAR(20),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Upgrade older databases if tables already existed

  await ensureColumn(
    "diabetes_predictions",
    "user_id",
    "INT NULL"
  );

  await ensureColumn(
    "diabetes_predictions",
    "risk_level",
    "VARCHAR(20) NULL"
  );

  await ensureColumn(
    "heart_predictions",
    "user_id",
    "INT NULL"
  );

  await ensureColumn(
    "heart_predictions",
    "chest_pain",
    "INT NULL"
  );

  await ensureColumn(
    "heart_predictions",
    "risk_level",
    "VARCHAR(20) NULL"
  );

  console.log("Tables ready");
}

module.exports = {
  pool,
  initDb
};