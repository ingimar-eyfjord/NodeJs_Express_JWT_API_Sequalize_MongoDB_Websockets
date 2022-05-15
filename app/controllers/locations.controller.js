const db = require("../models/index.js");
const Locations = db.locations;
const Op = db.Sequelize.Op;

// Create and Save a new Tasks
exports.create = (req, res) => {
  // #swagger.tags = ["Locations"]
  // #swagger.description = 'Endpoint para obter um usuário.'
  // Validate request
  if (!req.body.day) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  }
  // Create a Tasks
  const newLocations = {
    Teams: req.body.Date_start_time,
  };

  // Save Tasks in the database
  Locations.create(newLocations)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while creating the Tasks.",
      });
    });
};

// Retrieve all Locations from the database.
exports.findAll = (req, res) => {
  // #swagger.tags = ["Locations"]
  // #swagger.description = 'Endpoint para obter um usuário.'
  const title = req.query.title;
  var condition = title ? { title: { [Op.like]: `%${title}%` } } : null;

  Locations.findAll({ where: condition })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving Locations.",
      });
    });
};

// Find a single TeLocationsams with an id
exports.findOne = (req, res) => {
  // #swagger.tags = ["Locations"]
  // #swagger.description = 'Endpoint para obter um usuário.'
  const id = req.params.id;

  Locations.findByPk(id)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving Locations with id=" + id,
      });
    });
};

// Update a Locations by the id in the request
exports.update = (req, res) => {
  // #swagger.tags = ["Locations"]
  // #swagger.description = 'Endpoint para obter um usuário.'
  const id = req.params.id;

  Locations.update(req.body, {
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Locations was updated successfully.",
        });
      } else {
        res.send({
          message: `Cannot update Locations with id=${id}. Maybe Locations was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error updating Locations with id=" + id,
      });
    });
};

// Delete a Locations with the specified id in the request
exports.delete = (req, res) => {
  // #swagger.tags = ["Locations"]
  // #swagger.description = 'Endpoint para obter um usuário.'
  const id = req.params.id;

  Locations.destroy({
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Locations was deleted successfully!",
        });
      } else {
        res.send({
          message: `Cannot delete Locations with id=${id}. Maybe Locations was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete Locations with id=" + id,
      });
    });
};

// Delete all Locations from the database.
exports.deleteAll = (req, res) => {
  // #swagger.tags = ["Locations"]
  // #swagger.description = 'Endpoint para obter um usuário.'
  Locations.destroy({
    where: {},
    truncate: false,
  })
    .then((nums) => {
      res.send({ message: `${nums} Locations were deleted successfully!` });
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while removing all Teams.",
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
