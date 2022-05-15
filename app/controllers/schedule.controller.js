const db = require("../models/index.js");
const Schedule = db.schedule;
const Op = db.Sequelize.Op;
const {Transaction_ID } = require("../models/index.js");

// Create and Save a new Schedule
exports.create = async (req, res) => {
 // #swagger.tags = ['Schedule']
  // #swagger.description = 'Creates a schedule record'
  // Validate request
console.log(req.body)
  if (!req.body.Date_start_time) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  }
  if (!req.body.Date_end_time) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  }
  if (!req.body.Hours) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  }
  if (!req.body.Email) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  }
  if (!req.body.Team) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  }
  if (!req.body.Location) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  }

  if (!req.body.User_UUID) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }
  var table_number = req.body.Table_number;
  var _break = req.body.Break;
  if (req.body.Table_number === undefined || req.body.Table_number === null ) {
    table_number = null
  }
  if (req.body.Break === 0 || req.body.Break === undefined) {
  	_break = 0;
  }
  const t = await db.sequelize.transaction()
  try {
  const id = await Transaction_ID.create("", { transaction: t });
     // Create a Schedule
  const schedule = {
    Date_start_time: req.body.Date_start_time,
    Date_end_time: req.body.Date_end_time,
    Hours: req.body.Hours,
    Email: req.body.Email,
    User: req.body.User,
    Team: req.body.Team,
    Location: req.body.Location,
    Table_number: table_number,
    Break: _break,
    User_UUID: req.body.User_UUID,
    Transaction_ID: id.Transaction_ID,
  };
  // Save Schedule in the database
 const data = await Schedule.create(schedule, { transaction: t, "User": req.headers["useruuid"]});
    await t.commit();
    res.send({message:"Successfully logged the schedules",data});
  } catch (err) {
      console.log(err)
      await t.rollback();
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the schedule.",
      });
    }
};

// Retrieve all Schedules from the database.
exports.findAll = (req, res) => {
   // #swagger.tags = ['Schedule']
  // #swagger.description = 'Retrieves all schedule records'
  const title = req.query.title;
  var condition = title ? { title: { [Op.like]: `%${title}%` } } : null;

  Schedule.findAll({ where: condition })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving Schedules.",
      });
    });
};

// Find a single Schedule with an id
exports.findOne = (req, res) => {
   // #swagger.tags = ['Schedule']
  // #swagger.description = 'Retrieves a schedule record with an ID'
  const id = req.params.id;

  Schedule.findByPk(id)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving Schedule with id=" + id,
      });
    });
};

// Find a single Schedule with an id
exports.findAllInDay = (req, res) => {
   // #swagger.tags = ['Schedule']
  // #swagger.description = 'Retrieves all schedule records between two dates (not created at)'
  //const data = JSON.parse(req.params.day);
    Schedule.findAll({
      where: {
        [Op.and]: {
          "Date_start_time": {
            [Op.lte]: req.params.end,
          },
          "Date_end_time": {
            [Op.gte]: req.params.start
          }
        }
      },
  })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving Schedule with id=" + req.params.day,
      });
    });
};

// Update a Schedule by the id in the request
exports.update = (req, res) => {
   // #swagger.tags = ['Schedule']
  // #swagger.description = 'Updates a schedule record using an ID'
  const id = req.params.id;

  Schedule.update(req.body, {
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Schedule was updated successfully.",
        });
      } else {
        res.send({
          message: `Cannot update Schedule with id=${id}. Maybe Schedule was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error updating Schedule with id=" + id,
      });
    });
};

// Delete a Schedule with the specified id in the request
exports.delete = async (req, res) => {
   // #swagger.tags = ['Schedule']
  // #swagger.description = 'Deletes a schedule record using an ID'
  const id = req.params.id;
  let data = await Schedule.findByPk(id)
  Schedule.destroy({
    where: { id: id },
    User: req.headers["useruuid"],
    BeforeData:data.dataValues
  },)
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Schedule was deleted successfully!",
        });
      } else {
        res.send({
          message: `Cannot delete Schedule with id=${id}. Maybe Schedule was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete Schedule with id=" + id,
      });
    });
};


exports.pageDaysFromToday = (req, res) => {
   // #swagger.tags = ['Schedule']
  // #swagger.description = 'Retrieves all schedule records from one date with limit and offset'

  Schedule.findAll({
    where: {
      Date_start_time: {
        [Op.gte]: req.params.date,
      },
      User_UUID: {
        [Op.eq]: req.params.UserUUID,
      }
    },
    limit: req.params.limit,
    offset: req.params.offset,
  })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving Schedule with id=" + req.params.date,
      });
    });
};

exports.DayAndUser = (req, res) => {
   // #swagger.tags = ['Schedule']
  // #swagger.description = 'Retrieves all schedule records for a user in between two dates'

  Schedule.findAll({
    where: {
      Date_start_time: {
        [Op.between]: [req.params.start, req.params.end],
      },
      User_UUID: {
        [Op.eq]: req.params.UserUUID,
      }
    },
  })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving Schedule with id=" + req.params.day,
      });
    });
};

exports.GetBooked = (req, res) => {
   // #swagger.tags = ['Schedule']
  // #swagger.description = 'Retrieves all schedule records between two dates that have a table booking'

  // was:"/Schedule/GetBooked/:param"
  //! change from params to dates
  // is:"/Schedule/start/:date/end/:date/tables"
  

  Schedule.findAll({
    where: {
      Date_start_time: {
        [Op.between]: [req.params.start, req.params.end],
      },
      Location: {
        [Op.eq]: "Office",
      },
      Table_number: {
        [Op.gt]: 0,
      },
    },
  })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving Schedule with id=" + req.params.day,
      });
    });
};

exports.pingTrueFalse = (req, res) => {
   // #swagger.tags = ['Schedule']
  // #swagger.description = 'Check if user has shceduled a day in between two days'

  // was:"/Schedule/pingTrueFalse/:param"
  //! Change from email to UUID
  // is:"/Schedule/user/:UserUUID/start/:date/end/:date/ping"

  
  return Schedule.count({
    where: {
      Date_start_time: {
        [Op.between]: [req.params.start, req.params.end],
      },
      User_UUID: {
        [Op.eq]: req.params.UserUUID,
      }
    },
  })
    .then((count) => {
      if (count != 0) {
        res.send(true);
      } else {
        res.send(false);
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving Schedule",
      });
    });
};


exports.Import = (req, res) => {
   // #swagger.tags = ['Schedule']
  // #swagger.description = 'Accepts json for imports to schedule.'
  req.body[0].forEach(e=>{
    console.log(e)
    if (!e.User) {
      console.log("user")
      res.status(400).send({
        message: "Content can not be empty!",
      });
      return;
  }
  if (!e.Email) {
    console.log("Email")
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  }
  if (!e.Team) {
    console.log("Team")
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  }
  if (!e.Date_start_time) {
    console.log("Date_start_time")
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  }
  if (!e.Date_end_time) {
    console.log("Date_end_time")
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  }
  if (!e.Hours) {
    console.log("Hours")
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  }
  if (!e.Location) {
    console.log("Location")
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  }
  if (e.Table_number === undefined) {
    console.log("table")
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  }
  if (e.Break === undefined) {
    console.log("Break")
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  }
  if (e.User_UUID === undefined) {
    console.log("Break")
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  }

})
  return Schedule.bulkCreate(req.body[0]).then((data) => {
    res.send(data);
  })
  .catch((err) => {
    console.log(err)
    res.status(500).send({
      message: err.message || "Some error occurred while creating the Schedule.",
    });
  });
};
