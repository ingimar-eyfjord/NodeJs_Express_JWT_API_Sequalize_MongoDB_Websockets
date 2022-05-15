const db = require("../models/index.js");
const Teams = db.teams;
const Op = db.Sequelize.Op;

// Create and Save a new Tasks
exports.create = (req, res) => {
  // #swagger.tags = ["Teams"]
  // #swagger.description = 'Creates a record of a team'
  // Validate request
  if (!req.body.day) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  }
  // Create a Tasks
  const newTeam = {
    Teams: req.body.Date_start_time,
  };

  // Save Tasks in the database
  Teams.create(newTeam)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while creating the Tasks.",
      });
    });
};

// Retrieve all Teams from the database.
exports.findAll = (req, res) => {
  // #swagger.tags = ["Teams"]
  // #swagger.description = 'Retrieves all records of teams'
  const title = req.query.title;
  var condition = title ? { title: { [Op.like]: `%${title}%` } } : null;

  Teams.findAll({ where: condition })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving Teams.",
      });
    });
};

// Find a single Teams with an id
exports.findOne = (req, res) => {
  // #swagger.tags = ["Teams"]
  // #swagger.description = 'Retrieves a single team with an ID'
  const id = req.params.id;

  Teams.findByPk(id)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving Teams with id=" + id,
      });
    });
};

// Update a Teams by the id in the request
exports.update = (req, res) => {
  // #swagger.tags = ["Teams"]
  // #swagger.description = 'Updates a team record using an ID'
  const id = req.params.id;

  Teams.update(req.body, {
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Teams was updated successfully.",
        });
      } else {
        res.send({
          message: `Cannot update Teams with id=${id}. Maybe Teams was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error updating Teams with id=" + id,
      });
    });
};

// Delete a Teams with the specified id in the request
exports.delete = (req, res) => {
  // #swagger.tags = ["Teams"]
  // #swagger.description = 'Deletes a teams record using an ID'
  const id = req.params.id;

  Teams.destroy({
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Teams was deleted successfully!",
        });
      } else {
        res.send({
          message: `Cannot delete Teams with id=${id}. Maybe Teams was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete Teams with id=" + id,
      });
    });
};


// This controller can be modified a little to return pagination response:

// {
//     "totalItems": 8,
//     "Taskss": [...],
//     "totalPages": 3,
//     "currentPage": 1
// }
//https://bezkoder.com/node-js-sequelize-pagination-mysql/

// /api/Taskss: GET, POST, DELETE
// /api/Taskss/:id: GET, PUT, DELETE
// /api/Taskss/published: GET
