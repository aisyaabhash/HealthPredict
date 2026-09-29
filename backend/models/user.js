const { pool } = require("./init");
const bcrypt = require("bcryptjs");

async function createUser(username, password) {
  const hash = await bcrypt.hash(password, 10);

  const [result] = await pool.query(
    `
    INSERT INTO users
    (username, password_hash)
    VALUES (?, ?)
    `,
    [username, hash]
  );

  return result.insertId;
}

async function findUserByUsername(username) {
  const [rows] = await pool.query(
    `
    SELECT *
    FROM users
    WHERE username = ?
    `,
    [username]
  );

  return rows[0];
}

module.exports = {
  createUser,
  findUserByUsername
};