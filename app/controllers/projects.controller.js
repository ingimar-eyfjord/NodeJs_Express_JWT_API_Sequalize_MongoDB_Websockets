const db = require("../models/index.js");
const Projects = db.projects;
const Op = db.Sequelize.Op;

// Create and Save a new Projects
exports.create = (req, res) => {
  // #swagger.tags = ["Projects"]
  // #swagger.description = 'Creates a single record of a project'
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  }
  // Create a Projects

  

  // Save Projects in the database
  Projects.create(req.body)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      console.log(err)
      res.status(500).send({
        message: err.message || "Some error occurred while creating the Projects.",
      });
    });
};

// Retrieve all Projectss from the database.
exports.findAll = (req, res) => {
  // #swagger.tags = ["Projects"]
  // #swagger.description = 'Retrieves all records of projects'
  const title = req.query.title;
  var condition = title ? { title: { [Op.like]: `%${title}%` } } : null;

  Projects.findAll({ where: condition })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving Projectss.",
      });
    });
};

// Find a single Projects with an id
exports.findOne = (req, res) => {
  // #swagger.tags = ["Projects"]
  // #swagger.description = 'Retrieves single record using an ID'
  const id = req.params.id;

  Projects.findByPk(id)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving Projects with id=" + id,
      });
    });
};


// Update a Projects by the id in the request
exports.update = (req, res) => {
  // #swagger.tags = ["Projects"]
  // #swagger.description = 'Updates a single project using an ID'
  console.log("called")
  const id = req.params.id;
  Projects.update(req.body, {
    where: { Project: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Projects was updated successfully.",
        });
      } else {
        res.send({
          message: `Cannot update Projects with id=${id}. Maybe Projects was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error updating Projects with id=" + id,
      });
    });
};

// Delete a Projects with the specified id in the request
exports.delete = (req, res) => {
  // #swagger.tags = ["Projects"]
  // #swagger.description = 'Deletes a project using an ID'
  const id = req.params.id;

  Projects.destroy({
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Projects was deleted successfully!",
        });
      } else {
        res.send({
          message: `Cannot delete Projects with id=${id}. Maybe Projects was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete Projects with id=" + id,
      });
    });
};

// Find all Projects for specific team
exports.GetAllInTeam = (req, res) => {
  // #swagger.tags = ["Projects"]
  // #swagger.description = 'Fix this logic with department id's from EMPLY'
  Projects.findAll({ where: { [Object.values(req.params)]: 1 } })
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
//     "Projectss": [...],
//     "totalPages": 3,
//     "currentPage": 1
// }
//https://bezkoder.com/node-js-sequelize-pagination-mysql/

// /api/Projectss: GET, POST, DELETE
// /api/Projectss/:id: GET, PUT, DELETE
// /api/Projectss/published: GET
