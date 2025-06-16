const commentModel = require("../models/comment-model");
const utilities = require("../utilities/");
const invModel = require("../models/inventory-model"); // Para volver a renderizar detalle vehículo si hay error

const commentController = {};

// Guardar comentario
commentController.saveComment = async (req, res) => {
  const { comment_text, inv_id } = req.body;
  const account_id = res.locals.accountData.account_id;

  try {
    if (!comment_text || !inv_id) {
      throw new Error("Missing comment or vehicle ID.");
    }

    await commentModel.addComment(comment_text, inv_id, account_id);
    res.redirect(`/inv/detail/${inv_id}`);
  } catch (error) {
    console.error("Error saving comment:", error);
    const nav = await utilities.getNav();
    const item = await invModel.getInventoryItemById(inv_id);
    const comments = await commentModel.getCommentsByVehicleId(inv_id);

    res.status(500).render("inventory/detail", {
      title: item.inv_make + " " + item.inv_model,
      nav,
      item,
      comments,
      errorMessage: "Sorry, we could not save your comment.",
      loggedin: true,
    });
  }
};

module.exports = commentController;
