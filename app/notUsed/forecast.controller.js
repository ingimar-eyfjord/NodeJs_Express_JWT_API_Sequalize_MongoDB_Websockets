const db = require("../models/index.js");
const Forecast = db.forecast;
const Op = db.Sequelize.Op;
// Create and Save a new Forecast
exports.create = (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  }

  // Create a Forecast
  const forecast = {
    userID: req.body.userID,
    month: req.body.month,
    hours: req.body.hours,
  };

  // Save Forecast in the database
  Forecast.create(forecast)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        // message: err.message || "Some error occurred while creating the Forecast.",
        err,
      });
    });
};

// Retrieve all Forecasts from the database.
exports.findAll = (req, res) => {
  const title = req.query.title;
  var condition = title ? { title: { [Op.like]: `%${title}%` } } : null;

  Forecast.findAll({ where: condition })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        // message: err.message || "Some error occurred while retrieving Forecasts.",
        err,
      });
    });
};

// Find a single Forecast with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Forecast.findByPk(id)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        // message: "Error retrieving Forecast with id=" + id,
        err,
      });
    });
};

// Update a Forecast by the id in the request
exports.update = (req, res) => {
  const id = req.params.id;

  Forecast.update(req.body, {
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Forecast was updated successfully.",
        });
      } else {
        res.send({
          message: `Cannot update Forecast with id=${id}. Maybe Forecast was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        // message: "Error updating Forecast with id=" + id,
        err,
      });
    });
};

// Delete a Forecast with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Forecast.destroy({
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Forecast was deleted successfully!",
        });
      } else {
        res.send({
          message: `Cannot delete Forecast with id=${id}. Maybe Forecast was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        // message: "Could not delete Forecast with id=" + id,
        err,
      });
    });
};

// // Delete all Forecasts from the database.
// exports.deleteAll = (req, res) => {
//   Forecast.destroy({
//     where: {},
//     truncate: false,
//   })
//     .then((nums) => {
//       res.send({ message: `${nums} Forecasts were deleted successfully!` });
//     })
//     .catch((err) => {
//       res.status(500).send({
//         message: err.message || "Some error occurred while removing all Forecasts.",
//       });
//     });
// };

// Find all Forecast for specific team
exports.GetAllInTeam = (req, res) => {
  Forecast.findAll({ where: { [Object.values(req.params)]: 1 } })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        // message: err.message || "Some error occurred while retrieving Forecasts.",
        err,
      });
    });
};

// Find all Forecast for specific team
exports.GetAllUserID = (req, res) => {
  Forecast.findAll({ where: { userID: req.params.userID } })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        // message: err.message || "Some error occurred while retrieving Forecasts.",
        err,
      });
    });
};
// Find all Forecast for specific team
exports.GetAllUserIDAndMonth = (req, res) => {
  Forecast.findAll({
    where: {
      userID: {
        [Op.eq]: req.params.userID,
      },
      month: {
        [Op.eq]: req.params.month,
      },
    },
  })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        // message: err.message || "Some error occurred while retrieving Forecasts.",
        err,
      });
    });
};
exports.GetAllUserIDAndThreeMonths = (req, res) => {
  const params = JSON.parse(req.params.param);
  Forecast.findAll({
    where: {
      month: {
        [Op.between]: [params.start, params.end],
      },
      userID: {
        [Op.eq]: req.params.userID,
      },
    },
  })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        // message: err.message || "Some error occurred while retrieving Forecasts.",
        err,
      });
    });
};
