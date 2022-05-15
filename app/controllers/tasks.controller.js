const db = require("../models/index.js");
const Tasks = db.tasks;
const Op = db.Sequelize.Op;

// Create and Save a new Tasks
exports.create = (req, res) => {
   // #swagger.tags = ["Tasks"]
  // #swagger.description = 'Creates a record of a task'
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  }
  //! Create a Tasks but with dynamic team columns (creates inputs for requested teams)
 

  // Save Tasks in the database
  Tasks.create(req.body)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      console.log(err)
      res.status(500).send({
        message: err.message || "Some error occurred while creating the Tasks.",
      });
    });
};

// Retrieve all Taskss from the database.
exports.findAll = (req, res) => {
    // #swagger.tags = ["Tasks"]
  // #swagger.description = 'Retrieves all records of tasks'
  // const title = req.query.title;
  // var condition = title ? { title: { [Op.like]: `%${title}%` } } : null;

  Tasks.findAll()
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      console.log(err)
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving Tasks.",
      });
    });
};
// Find a single Tasks with an id
exports.findOne = (req, res) => {
    // #swagger.tags = ["Tasks"]
  // #swagger.description = 'Retrieves a single record using an ID'
  const id = req.params.id;
  Tasks.findByPk(id)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving Tasks with id=" + id,
      });
    });
};

// Update a Tasks by the id in the request
exports.update = (req, res) => {
    // #swagger.tags = ["Tasks"]
  // #swagger.description = 'Updates a single task record using an ID'
  const id = req.params.id;

  Tasks.update(req.body, {
    where: { Task: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Tasks was updated successfully.",
        });
      } else {
        res.send({
          message: `Cannot update Tasks with id=${id}. Maybe Tasks was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error updating Tasks with id=" + id,
      });
    });
};

exports.BulkUpdate = (req, res) => {
// #swagger.tags = ["Tasks"]
// #swagger.description = 'Updates a single task record using an ID'
const id = req.params.id.split(',')
Tasks.update(req.body, {
  where: { Task: req.params.id },
})
  .then((num) => {
    if (num == 1) {
      res.send({
        message: "Tasks was updated successfully.",
      });
    } else {
      res.send({
        message: `Cannot update Tasks with id=${id}. Maybe Tasks was not found or req.body is empty!`,
      });
    }
  })
  .catch((err) => {
    console.log(err)
    res.status(500).send({
      message: "Error updating Tasks with id=" + id,
    });
  });
};


// Delete a Tasks with the specified id in the request
exports.delete = (req, res) => {
    // #swagger.tags = ["Tasks"]
  // #swagger.description = 'Deletes a single record using an ID'
  const id = req.params.id;
  Tasks.destroy({
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Tasks was deleted successfully!",
        });
      } else {
        res.send({
          message: `Cannot delete Tasks with id=${id}. Maybe Tasks was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete Tasks with id=" + id,
      });
    });
};

// Find all Tasks for specific team
exports.GetAllInTeam = (req, res) => {
    // #swagger.tags = ["Tasks"]
  // #swagger.description = 'Retrieves all tasks belonging to a team'
//{ where: { Belongs_to:  req.params.team} }
  Tasks.findAll({ where: { Belongs_to:{ [Op.like]: '%' + req.params.team + '%'} }})
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
//     "Taskss": [...],
//     "totalPages": 3,
//     "currentPage": 1
// }
//https://bezkoder.com/node-js-sequelize-pagination-mysql/

// /api/Taskss: GET, POST, DELETE
// /api/Taskss/:id: GET, PUT, DELETE
// /api/Taskss/published: GET
