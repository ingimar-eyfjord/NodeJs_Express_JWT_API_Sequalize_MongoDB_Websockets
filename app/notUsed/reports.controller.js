const db = require("../models/index.js");
const Reports = db.reports;
const Op = db.Sequelize.Op;

// Create and Save a new Reports
exports.create = (req, res) => {
    // #swagger.tags = ["Reports"]
  // #swagger.description = 'Creates a single report record'
  // Validate request
  if (!req.body.day) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  }
  // Create a Reports
  const reports = {
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

  // Save Reports in the database
  Reports.create(reports)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Reports.",
      });
    });
};

// Retrieve all Reportss from the database.
exports.findAll = (req, res) => {
     // #swagger.tags = ["Reports"]
  // #swagger.description = 'Retireves all reports from the database'
  const title = req.query.title;
  var condition = title ? { title: { [Op.like]: `%${title}%` } } : null;

  Reports.findAll({ where: condition })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving Reportss.",
      });
    });
};

// Find a single Reports with an id
exports.findOne = (req, res) => {
   // #swagger.tags = ["Reports"]
  // #swagger.description = 'Finds a single report record using an ID'
  const id = req.params.id;

  Reports.findByPk(id)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving Reports with id=" + id,
      });
    });
};

// Find a single Reports with an id
exports.findAllInDay = (req, res) => {
   // #swagger.tags = ["Reports"]
  // #swagger.description = 'Retrieves all reports that fall in between two days.'
  const data = JSON.parse(req.params.day);
  Reports.findAll({
    where: {
      Date_start_time: {
        [Op.between]: [data.start, data.end],
      },
    },
  })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving Reports with id=" + req.params.day,
      });
    });
};

// Update a Reports by the id in the request
exports.update = (req, res) => {
     // #swagger.tags = ["Reports"]
  // #swagger.description = 'Updates a Reports by the records id'
  const id = req.params.id;

  Reports.update(req.body, {
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Reports was updated successfully.",
        });
      } else {
        res.send({
          message: `Cannot update Reports with id=${id}. Maybe Reports was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error updating Reports with id=" + id,
      });
    });
};

// Delete a Reports with the specified id in the request
exports.delete = (req, res) => {
     // #swagger.tags = ["Reports"]
  // #swagger.description = 'Deletes a report using an ID'
  const id = req.params.id;

  Reports.destroy({
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Reports was deleted successfully!",
        });
      } else {
        res.send({
          message: `Cannot delete Reports with id=${id}. Maybe Reports was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete Reports with id=" + id,
      });
    });
};

// Find all Tasks for specific team
exports.GetAllInTeam = (req, res) => {
     // #swagger.tags = ["Reports"]
  // #swagger.description = 'Retrieves all records of reports belonging to a team using team ID'
  Reports.findAll({ where: { [Object.values(req.params)]: 1 } })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving Taskss.",
      });
    });
};

// This controller can be modified a little to return pagination response:

// {
//     "totalItems": 8,
//     "Reportss": [...],
//     "totalPages": 3,
//     "currentPage": 1
// }
//https://bezkoder.com/node-js-sequelize-pagination-mysql/

// /api/Reportss: GET, POST, DELETE
// /api/Reportss/:id: GET, PUT, DELETE
// /api/Reportss/published: GET
