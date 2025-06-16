const pool = require("../database/");

const commentModel = {};

// Insertar nuevo comentario
commentModel.addComment = async (comment_text, inv_id, account_id) => {
  try {
    const sql = `
      INSERT INTO comments (comment_text, inv_id, account_id)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const result = await pool.query(sql, [comment_text, inv_id, account_id]);
    return result.rows[0];
  } catch (error) {
    throw new Error("Error adding comment: " + error.message);
  }
};

// Obtener comentarios de un vehículo por su inv_id
commentModel.getCommentsByVehicleId = async (inv_id) => {
  try {
    const sql = `
      SELECT c.comment_text, c.comment_date, a.account_firstname || ' ' || a.account_lastname AS commenter
      FROM comments c
      JOIN account a ON c.account_id = a.account_id
      WHERE c.inv_id = $1
      ORDER BY c.comment_date DESC;
    `;
    const result = await pool.query(sql, [inv_id]);
    return result.rows;
  } catch (error) {
    throw new Error("Error fetching comments: " + error.message);
  }
};

module.exports = commentModel;
