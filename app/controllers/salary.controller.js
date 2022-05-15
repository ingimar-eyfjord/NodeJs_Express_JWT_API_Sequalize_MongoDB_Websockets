var moment = require('moment-timezone');
const db = require("../models/index.js");
const { sequelize, Transaction_ID } = require("../models/index.js");
const salary_period = db.salary_period;
const Op = db.Sequelize.Op;
const Ledger = db.ledger;
const Hours = db.hours;
const { Sequelize } = require("sequelize");
const fetch = require("node-fetch");
const API = process.env.Emply_api;
import { map, filter, isNumber, conformsTo } from 'lodash';
let handleQueryError = function (err) {
  return new Response(
    JSON.stringify({
      code: 400,
      message: "Network Error",
    })
  );
};
// Create and Save a new Reports
exports.create_period = (req, res) => {
  // #swagger.tags = ["Salary"]
  // #swagger.description = 'Creates a record of a salary period'
  // Validate request
  if (!req.body.Month_name) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  }
  if (!req.body.Date_start) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  }
  if (!req.body.Date_end) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  }
  // Create a Reports
  const Salary_period = {
    Date_start: req.body.Date_start,
    Date_end: req.body.Date_end,
    Month_name: req.body.Month_name,
  };

  // Save salary period in the database
  salary_period.create(Salary_period)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the salary period.",
      });
    });
};

exports.GetPeriodByDay = async (req, res) => {
  // #swagger.tags = ["Salary"]
  // #swagger.description = 'Retrieves all ledger items for a user'
  const date = req.params.date
  const userID = req.params.UserUUID
  salary_period.findAll({
    where: {
      Date_start: { [Op.lte]: date },
      Date_end: { [Op.gte]: date },
    },
    include: [
      {
        model: Ledger,
        where: {
          Account: userID,
        },
        attributes: []
      },
    ],
    group: [
      "Salary_period.id", "Ledgers.id", "Ledgers.Account"
    ],
    attributes: ["Ledgers.Account", [sequelize.fn('sum', sequelize.col('Hours')), 'totalHours']],
    raw: true,
    group: [
      "Ledgers.Account",
    ],
  }).then(data => {
    res.send(data);
  }).catch((err) => {
    res.status(500).send({
      message: "Error retrieving hours",
    });
  });;
  // res.send(total_meetings)
};
exports.export_salary = async (req, res) => {
  // #swagger.tags = ["Salary"]
  // #swagger.description = 'Retrieves all ledger items for a user'
  const data = await Transaction_ID.findAll({
    include: [
      {
        model: Hours,
      },
      {
        model: Ledger,
        where: {
          Salary_period: {
            [Op.eq]: [req.params.id],
          },
        },
      },
    ]
  })
  let period;
  try {
    period = await salary_period.findOne({
      where: {
        id: {
          [Op.eq]: [req.params.id],
        },
      }, raw: true
    })
  } catch (error) {
    period = req.params.id
  }
  try {
    // let accessTokenReqOptions = {
    //   method: "GET",
    //   headers: {
    //     Accept: "application/json",
    //     "Content-Type": "application/json; charset=utf-8",
    //   },
    // };
    // const url = `https://api.emply.com/v1/dialogueone/employees/find-by-date?date=01-01-2008&apiKey=${API}`
    // let response = await fetch(
    //   encodeURI(url),
    //   accessTokenReqOptions
    // ).catch(handleQueryError);
    // let Emplydata;
    // try {
    //   Emplydata = await response.json()
    // } catch (error) {
    //   Emplydata = error
    // }
    let accessTokenReqOptions = {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${req.headers["msbearertoken"]}`,
      },
    };
    const url5 = `https://graph.microsoft.com/v1.0/users`
    let response = await fetch(url5,
      accessTokenReqOptions
    )
    let AzureData;
    try {
      AzureData = await response.json()
    } catch (error) {
      AzureData = error
    }

    if (!response.ok) {
      res.status(400).json({ error: "something went wrong" });
      return
    } else {

// res.send(AzureData);
// return
// console.log(AzureData)
// for (const e of Object.values(AzureData)[1]) {
//   console.error(e)

// }

      for (const d of data) {
        if (d.Hour) {
        d.Hour.dataValues['Salary period'] = moment(period.Month_name).format("MMMM")
        d.Hour.dataValues['Week number'] = moment(d.Hour.dataValues.Date).isoWeek();
        }
        for (const e of AzureData.value) {
          for (const l of d.Ledgers) {
            l.Salary_period = period.Month_name
            if (l.Account == e.id) {
              l.dataValues.Owner = e.displayName
              if (!d.Hour) {
                continue
              }
              d.Hour.dataValues.UserHours = parseFloat(l.Hours)
              d.Hour.dataValues.User = e.displayName
              d.Hour.dataValues.Initials = e.mail.substring(0, e.mail.indexOf("@")).toUpperCase();
              d.Hour.dataValues.Email = e.mail
            }
          }
        }
      }
    }
    const url2 = `https://api.emply.com/v1/dialogueone/departments?apiKey=${API}`
    let response2 = await fetch(
      encodeURI(url2),
      accessTokenReqOptions
    ).catch(handleQueryError);
    let Departments;
    try {
      Departments = await response2.json()
    } catch (error) {
      Departments = error
    }
    if (!response2.ok) {
      res.status(400).json({ error: "something went wrong" });
    } else {

      for (const d of data) {
        for (const e of Departments) {
          for (const l of d.Ledgers) {
            if (l.Account == e.id) {
              l.dataValues.Owner = e.title
            }
          }
          if (!d.Hour) {
            continue
          }
          if (d.Hour.Team == e.id) {
            d.Hour.dataValues.Team = e.title
          }
        }
      }
    }

    function change_format(datePa) {
      let utc = moment.utc(datePa).tz("Europe/Copenhagen").format()
      return utc
    }
    let Seporated = {
      Hour: [],
      Deffered: [],
      Ledgers: []
    }
    for (const e of data) {
      if (e.Hour !== null) {
        try {
          Object.keys(e.Hour.dataValues).map(function (key) {
            try {
              let num = parseFloat(e.Hour.dataValues[key])
              const date = change_format(e.Hour.dataValues[key])
              if (num !== new Date().getFullYear()) {
                if (isNaN(num) && moment(date).isValid()) {
                  e.Hour.dataValues[key] = date
                  return false;
                } else if (!isNaN(num)) {
                  e.Hour.dataValues[key] = parseFloat(e.Hour.dataValues[key])
                  return false
                }
              } else {
                e.Hour.dataValues[key] = e.Hour.dataValues[key]
                return false
              }
            } catch (error) {
              e.Hour.dataValues[key] = e.Hour.dataValues[key]
              return false
            }
          });
        } catch (error) {
          ""
        }
      }

      for (const t of e.Ledgers) {
        try {
          Object.keys(t.dataValues).map(function (key) {
            try {
              const Ids = t.dataValues[key].split("-").join('')
              try {
                if (t.dataValues[key].includes(".")) {
                  t.dataValues[key] = parseFloat(t.dataValues[key])
                  return false
                }
              } catch (error) {
                return false
              }
            } catch (error) {
              let num = parseFloat(t.dataValues[key])
              const date = change_format(t.dataValues[key])
              if (num !== new Date().getFullYear()) {
                if (isNaN(num) && moment(date).isValid()) {
                  t.dataValues[key] = date
                  return false;
                } else if (!isNaN(num)) {
                  t.dataValues[key] = parseFloat(t.dataValues[key])
                  return false;
                }
              }
            }
          });
        } catch (error) {
          console.error(error)
        }
        if (e.Hour !== null) {
          if (t.Debit === 1) {
            e.Hour.dataValues['Account id debit'] = t.Account
            e.Hour.dataValues['Hours debit'] = parseFloat(t.Hours)
          } else {
            e.Hour.dataValues['Account id credit'] = t.Account
            e.Hour.dataValues['Hours credit'] = parseFloat(t.Hours)
          }
          Seporated.Ledgers.push(t)
        }
      }

      if (!e.Hour) {
        for (const l of e.Ledgers) {
          Seporated.Deffered.push(l)
        }
      } else {
        Seporated.Hour.push(e.Hour)
      }
    }
    res.send(Seporated);
  } catch (error) {
    res.status(500).send({
      message:
        error.message || "Some error occurred while retrieving Reportss.",
    });
  }
}

exports.find_current_period = (req, res) => {
  // #swagger.tags = ["Salary"]
  // #swagger.description = 'Finds current period using the date of the server's location'
  const date = new Date()
  salary_period.findAll({
    where: {
      [Op.and]: {
        "Date_start": {
          [Op.lte]: date,
        },
        "Date_end": {
          [Op.gte]: date
        }
      }
    }
  })
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

// Retrieve all Reportss from the database.
exports.find_periods_in_year = (req, res) => {
  // #swagger.tags = ["Salary"]
  // #swagger.description = 'Finds all periods of a year, using a date.'
  const title = req.query.title;
  var condition = title ? { title: { [Op.like]: `%${title}%` } } : null;

  salary_period.findAll({ where: condition })
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
// Retrieve all Reportss from the database.
exports.find_periods_in_year_name = (req, res) => {
  // #swagger.tags = ["Salary"]
  // #swagger.description = 'Finds all periods of a year, using a date.'
  const title = req.query.title;
  var condition = title ? { title: { [Op.like]: `%${title}%` } } : null;

  salary_period.findAll({ attributes: ['Month_name'] }, { where: condition })
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
// Retrieve all Reportss from the database.
exports.find_period_by_month = (req, res) => {
  // #swagger.tags = ["Salary"]
  // #swagger.description = 'Retrieves a period in which a day falls in between the start and end of the period.'
  salary_period.findAll({ where: { Month_name: req.params.date } })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      console.log(err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving Reportss.",
      });
    });
};


exports.find_period_by_date = (req, res) => {
  // #swagger.tags = ["Salary"]
  // #swagger.description = 'Retrieves all ledger items for a user'
  salary_period.findAll({
    where:
    {
      Date_start: { [Op.lte]: req.params.date },
      Date_end: { [Op.gte]: req.params.date },
    }
  })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      console.log(err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving Reportss.",
      });
    });
}

// Update a Reports by the id in the request
exports.update_period = (req, res) => {
  // #swagger.tags = ["Salary"]
  // #swagger.description = 'Updates a single record of a salary period using an ID'
  const id = req.params.id;

  salary_period.update(req.body, {
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
exports.delete_period = (req, res) => {
  // #swagger.tags = ["Salary"]
  // #swagger.description = 'Deletes a single record of a salary period'
  const id = req.params.id;

  salary_period.destroy({
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

//? Deferred below here


// Create and Save a new Reports
exports.create_deferred = (req, res) => {
  // #swagger.tags = ["Salary"]
  // #swagger.description = 'Creates a double transactional ledger records for one user. A debit record for the salary-period the user wishes to deffer hours from and a credit record for the salary-period the user wishes to defer hours to.'
  // Validate request
  if (!req.body.day) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  }
  // Create a Reports
  const Salary_period = {
    Date_start: req.body.Start,
    Date_end: req.body.End,
    Month_name: req.body.Month,
  };

  // Save salary period in the database
  salary_period.create(Salary_period)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the salary period.",
      });
    });
};



// Retrieve all Reportss from the database.
exports.find_deferred_by_user = (req, res) => {
  // #swagger.tags = ["Salary"]
  // #swagger.description = 'Retrieves all ledger items for a user'
  const title = req.query.title;
  var condition = title ? { title: { [Op.like]: `%${title}%` } } : null;

  salary_period.findAll({ where: condition })
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

// Update a Reports by the id in the request
exports.update_deferred = (req, res) => {
  // #swagger.tags = ["Salary"]
  // #swagger.description = 'Update double transactional data in ledger, updates should only be done on status and types, use transaction_id to update both.'
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

exports.delete_deferred = (req, res) => {
  // #swagger.tags = ["Salary"]
  // #swagger.description = 'should not be here....'
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


exports.get_period_for_announce = async () => {
  // #swagger.tags = ["Salary"]
  // #swagger.description = 'Endpoint para obter um usuário.'
  const month = moment().format("MMMM-YYYY")
  const next = moment().add(1, 'M').format("MMMM-YYYY");
  let data;
  try {
    data = await salary_period.findAll({
      where: {
        [Op.or]: [
          { Month_name: month },
          { Month_name: next }
        ]
      }
    })
  } catch (error) {
    data = error
  }
  return data
};