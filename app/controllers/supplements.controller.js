const db = require("../models/index.js");
const Supplements = db.Transaction_type;
const Op = db.Sequelize.Op;
// Create and Save a new supplement
exports.create = (req, res) => {
  // #swagger.tags = ["Supplements"]
  // #swagger.description = 'Creates a record for supplements'
  // Validate request
  if (!req.body.day) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  }
  // Create a supplement
  const supplement = {
    Date_start_time: req.body.Date_start_time,
    Date_end_time: req.body.Date_end_time,
    Hours: req.body.Hours,
    Email: req.body.Email,
    User: req.body.User,
    Team: req.body.Team,
    User: req.body.User,
    Location: req.body.Location,
    Table_number: req.body.Table_number,
    Break: req.body.Break,
  };

  // Save Supplement in the database
  Supplements.create(supplement)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while creating the supplement.",
      });
    });
};

// Retrieve all supplements from the database.
exports.findAll = (req, res) => {
  // #swagger.tags = ["Supplements"]
  // #swagger.description = 'Retrieves all records for supplements'
  const title = req.query.title;
  var condition = title ? { title: { [Op.like]: `%${title}%` } } : null;
  Supplements.findAll({ where: condition })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving Supplements.",
      });
    });
};

// Find a single Supplement with an id
exports.findOne = (req, res) => {
  // #swagger.tags = ["Supplements"]
  // #swagger.description = 'Retrieves one record of supplements using an ID'
  const id = req.params.id;
  Supplements.findByPk(id)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving Supplement with id=" + id,
      });
    });
};

// Update a Supplement by the id in the request
exports.update = (req, res) => {
  // #swagger.tags = ["Supplements"]
  // #swagger.description = 'Updates one record using an ID'
  const id = req.params.id;
  Supplements.update(req.body, {
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Supplement was updated successfully.",
        });
      } else {
        res.send({
          message: `Cannot update Supplement with id=${id}. Maybe Supplement was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error updating Supplement with id=" + id,
      });
    });
};

// Delete a Supplement with the specified id in the request
exports.delete = (req, res) => {
  // #swagger.tags = ["Supplements"]
  // #swagger.description = 'Deletes one record using an ID'
  const id = req.params.id;
  Supplements.destroy({
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Supplement was deleted successfully!",
        });
      } else {
        res.send({
          message: `Cannot delete Supplement with id=${id}. Maybe Supplement was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete Supplement with id=" + id,
      });
    });
};
exports.GetEverything = (req, res) => {
  // #swagger.tags = ["Supplements"]
  // #swagger.description = 'Retrieves all records of supplements'
  Supplements.findAll()
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving Reports with id=" + req.params.day,
      });
    });
};
