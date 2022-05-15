const db = require("../models/index.js");
const Hours = db.hours;
const salary_period = db.salary_period;
const Op = db.Sequelize.Op;
const Ledger = db.ledger;
const { sequelize, Transaction_ID } = require("../models/index.js");
const fetch = require("node-fetch");
var moment = require('moment-timezone');
const API = process.env.Emply_api;

let handleQueryError = function (err) {
  return new Response(
    JSON.stringify({
      code: 400,
      message: "Network Error",
    })
  );
};


async function CreateTransaction(Object, t, req) {
  try {
    const date = new Date()
    let current_period = await salary_period.findAll({
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
    current_period = current_period[0]?.dataValues;
    const id = await Transaction_ID.create("", { transaction: t });
    Object.forEach(e => {
      e.Transaction_ID = id.Transaction_ID
      e.Salary_period = current_period.id
    })
    // Create a Hours
    const data = await Hours.create(Object[0], { transaction: t, "User": req.headers["useruuid"] });
    // Save Hours in the database
    //When saving hours and creating transaction ids and legder rows
    //We should only create one ledger row with credit. Makes it easier to calculate balance in 
    //the ledger controller
    const creditData = await Ledger.create(Object[1], { transaction: t });
    const debitData = await Ledger.create(Object[2], { transaction: t });
    return { data: [creditData, debitData, data] }
  } catch (err) {
    throw err
  }
}
// const transaction_id = db.Transaction_ID;
// Create and Save a new Hours
exports.create = async (req, res) => {
  // #swagger.tags = ['Hours']
  // #swagger.description = 'Creates an entry of hours and saves it as a double transactional data in Ledger table and one row as meta data in Hours'
  /* #swagger.parameters['PostHours'] = {
               in: 'body',
               description: 'Informações do usuário.',
               required: true,
               schema: { $ref: "#/definitions/PostHours }
        } */
  // Validate request
  if (!req.body.Date) {
    res.status(400).send({
      message: "Date can not be empty!",
    });
    return;
  }
  if (!req.body.Hours) {
    res.status(400).send({
      message: "Hours can not be empty!",
    });
    return;
  }
  if (!req.body.Project) {
    res.status(400).send({
      message: "Project can not be empty!",
    });
    return;
  }
  if (!req.body.Task) {
    res.status(400).send({
      message: "Task can not be empty!",
    });
    return;
  }
  if (req.body.Type == "" || req.body.Type == undefined || req.body.Type == null) {
    req.body.Type = "Normal"
  }

  const HoursDefine = {
    Date: req.body.Date,
    Email: req.body.Email,
    Project: req.body.Project,
    Task: req.body.Task,
    Description: req.body.Description,
    Team: req.body.Team,
    Contacts: req.body.Contacts,
    Meetings: req.body.Meetings,
  };
  const Credit_Row = {
    Account: req.body.Account_Credit,
    Hours: req.body.Hours,
    Debit: false,
    Credit: true,
    Type: req.body.Type,
    Status: "Unpaid"
  };
  const Debit_Row = {
    Account: req.body.Account_Debit,
    Hours: -req.body.Hours,
    Debit: true,
    Credit: false,
    Type: req.body.Type,
    Status: "Unpaid"
  };
  const t = await db.sequelize.transaction()
  try {
    let transaction = await CreateTransaction([HoursDefine, Credit_Row, Debit_Row], t, req)
    await t.commit();
    res.send({ message: "Successfully logged the hours", transaction });
  } catch (error) {
    await t.rollback();
    res.status(500).send({
      message:
        "Some error occurred while creating the transaction. Please contact IT support.",
    });
  }

};

// Retrieve all Hours from the database.
exports.findAll = (req, res) => {
  // #swagger.tags = ['Hours']
  // #swagger.description = 'Retrieves every hours records'
  Hours.findAll()
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving Hours.",
      });
    });
};
//! Look at this here Adriano...
exports.findUserBetween = (req, res) => {
  // #swagger.tags = ['Hours']
  // #swagger.description = 'Retrieves hour records for users in between two dates'

  // was:  router.get("/Hours/dayAndUser/:param", VerifyToken, hours.findUserBetween);
  // is:   router.get("/Hours/User/:UserUUID/start/:start/end/:end", VerifyToken, hours.findUserBetween);
  // const params = JSON.parse(req.params.param);
  Transaction_ID.findAll({
    include: [
      {
        model: Ledger,
        where: {
          Account: req.params.UserUUID,
        },
        //attributes: []
      },
      {
        model: Hours,
        where: {
          Date: {
            [Op.between]: [req.params.start, req.params.end],
          }
        },
        //attributes: []
      },
    ],


  }).then((data) => {

    // console.log(data)

    res.send(data)
  })
    .catch((err) => {
      console.error(err)
      res.status(500).send({
        message: "Error retrieving Hours with id=",
      });
    });
};
//! Look at this here Adriano...
exports.findUserByPeriod = (req, res) => {
  // #swagger.tags = ['Hours']
  // #swagger.description = 'Retrieves hour records for users in between two dates'

  // was:  router.get("/Hours/dayAndUser/:param", VerifyToken, hours.findUserBetween);
  // is:   router.get("/Hours/User/:UserUUID/start/:start/end/:end", VerifyToken, hours.findUserBetween);
  // const params = JSON.parse(req.params.param);


  function isValidJSONString(str) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }

  let query = {
    model: Ledger,
    where: {
      Account: req.params.UserUUID,
      Salary_period: req.params.period,
      Credit: {
        [Op.eq]: true,
      },
    },
    attributes: []
  }

  let filter = '';
  if (isValidJSONString(req.query.filter)) {
    //cool we are valid, lets parse
    filter = JSON.parse(req.query.filter);
    query.where.Type = {
      [Op.eq]: filter,
    }
  }


  Transaction_ID.findAll({
    include: [
      query,
      {
        model: Hours,
        required: true,
        attributes: []
      },
    ],
    group: [
      "Transaction_ID.Transaction_ID", "Ledgers.id", "Ledgers.Account"
    ],
    attributes: ["Ledgers.Account", [sequelize.fn('sum', sequelize.col('Hours')), 'Hours']],
    raw: true,
    group: [
      "Ledgers.Account",
    ],
  }).then((data) => {
    res.send(data)
  })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving Hours with id=",
      });
    });
};
// Find a single Hours with an id
exports.findOne = (req, res) => {
  // #swagger.tags = ['Hours']
  // #swagger.description = 'Retrieves a single hour record with id'
  const id = req.params.id;

  Hours.findByPk(id)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving Hours with id=" + id,
      });
    });
};
exports.findAllInDay = async (req, res) => {
  // #swagger.tags = ['Hours']
  // #swagger.description = 'Retrieves every hour record logged for a single day (not created at day)'
  // here
  const data = await Transaction_ID.findAll({
    include: [
      {
        model: Hours,
        where: {
          Date: {
            [Op.between]: [req.params.start, req.params.end],
          },
        },
      },
      {
        model: Ledger,
      }
    ]
  })

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
        ConsistencyLevel: 'eventual'
      },
    };

    let AzureUsers = []
    async function FetchUsers(url) {


      let AzureData;
      const url5 = url
      let response = await fetch(url5,
        accessTokenReqOptions
      )
      console.log(response)

      try {
        AzureData = await response.json()
        console.log(Object.keys(AzureData))
      } catch (error) {
        console.log(error)
        AzureData = error
      }
      if (!response.ok) {
        res.status(400).json({ error: "something went wrong" });
        return
      }
      if (AzureData['@odata.nextLink']) {
        await FetchUsers(AzureData['@odata.nextLink'])
      }
      AzureUsers.push(AzureData.value)
    }
    try {
      await FetchUsers(`https://graph.microsoft.com/v1.0/users?$count=true`)
    } catch (error) {
      console.log(error)
      res.status(400).json({ error: "something went wrong" });
    }
    AzureUsers = AzureUsers.flat()
    for (const d of data) {
      if (d.Hour) {
        d.Hour.dataValues['Week number'] = moment(d.Hour.dataValues.Date).isoWeek();
      }
      for (const e of AzureUsers) {
        for (const l of d.Ledgers) {
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
      Ledgers: [],
      AzureUsers: AzureUsers
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
    console.log(error)
    res.status(500).send({
      message:
        error.message || "Some error occurred while retrieving Reportss.",
    });
  }
}

// Update a Hours by the id in the request
exports.update = async (req, res) => {
  // #swagger.tags = ['Hours']
  // #swagger.description = 'Updates a single hour record with an ID'
  const id = req.params.id;
  let arr = []
  for (let key in Hours.rawAttributes) {
    arr.push(key); // this is name of the field
  }
  const UserUUID = req.body.User
  const DataKeys = Object.keys(req.body)
  const DataValue = Object.values(req.body)
  let ChangeMeta = {}
  let ChangeLedger = {}

  for (let i = 0; i < DataKeys.length; i++) {
    if (arr.includes(DataKeys[i]) && DataKeys[i] !== 'User') {
      ChangeMeta[DataKeys[i]] = DataValue[i]
    } else {
      DataKeys[i] !== 'User' ? ChangeLedger[DataKeys[i]] = DataValue[i] : null;
    }
  }
  //here

  try {


    if (Object.keys(ChangeMeta).length > 0) {
      try {
       await Hours.update(ChangeMeta, {
          where: { Transaction_ID: id },
        })
        if (Object.keys(ChangeLedger).length === 0) {
          res.status(200).send({ message: "Successfully changed project data of the logged hours" });
          return
        }
      } catch (error) {
        res.status(500).send({
          message: error.message,
        });
      }
    }


    let LedgersGet = await Ledger.findAll({
      where: { Transaction_ID: id },
      raw: true
    })
    let HourGet = await Hours.findAll({
      where: { Transaction_ID: id },
      raw: true
    })



    let Hour = JSON.parse(JSON.stringify(HourGet));
    let NewHour = JSON.parse(JSON.stringify(HourGet));
    let Ledgers = JSON.parse(JSON.stringify(LedgersGet));
    let RollBackLedgers = JSON.parse(JSON.stringify(LedgersGet));
    delete Hour[0].id

    let LedgerChangeData = null

    const t = await db.sequelize.transaction()
    if (Object.keys(ChangeLedger).length > 0) {

      try {

        if (ChangeLedger.Account || ChangeLedger.Type) {
          try {
            let rollbackLedger = []
            for (const e of RollBackLedgers) {
              delete e.Transaction_ID
              delete e.id
              e.Hours = (e.Hours) * (-1)
              rollbackLedger.push(e)
            }
            let newLedgers = []
            for (const ne of Ledgers) {
              delete ne.Transaction_ID
              delete ne.id
              ne.Type = ChangeLedger.Type ? ChangeLedger.Type : ne.Type
              if (ne.Account !== UserUUID) {
                ne.Account = ChangeLedger.Account ? ChangeLedger.Account : ne.Account
              }
              newLedgers.push(ne)
            }
            Hour[0].Contacts = (Hour[0].Contacts) * (-1)
            Hour[0].Meetings = (Hour[0].Meetings) * (-1)
            let NewHours = []
            for (const eh of NewHour) {
              delete eh.id
              delete eh.Transaction_ID
              eh.Team = ChangeLedger.Account ? ChangeLedger.Account : eh.Team
              NewHours.push(eh)
            }
            await CreateTransaction([Hour[0], rollbackLedger[0], rollbackLedger[1]], t, req)
            let data = await CreateTransaction([NewHours[0], newLedgers[0], newLedgers[1]], t, req)
            LedgerChangeData = data.data
          } catch (error) {
            console.log(error)
            await t.rollback();
            res.status(500).send({
              message:
                "Some error occurred while creating the transaction. Please contact IT support.",
            });
            return
          }
        }

        if (ChangeLedger.Hours) {
          if (LedgerChangeData) {
            Hour = [JSON.parse(JSON.stringify(LedgerChangeData[2].dataValues))];
            Ledgers = JSON.parse(JSON.stringify([LedgerChangeData[0].dataValues,LedgerChangeData[1].dataValues] ));
            delete Hour[0].id
            delete Hour[0].Transaction_ID
            console.log(LedgerChangeData)
          }
          Ledgers.forEach(e => {
            delete e.Transaction_ID
            delete e.id
            if (e.Account === UserUUID) {
              e.Hours = ChangeLedger.Hours
            } else {
              e.Hours = -ChangeLedger.Hours
            }
          })
          Hour[0].Contacts = null
          Hour[0].Meetings = null
          try {
            await CreateTransaction([Hour[0], Ledgers[0], Ledgers[1]], t, req)
          } catch (error) {
            console.error(error)
            await t.rollback();
            res.status(500).send({
              message:
                "Some error occurred while creating the transaction. Please contact IT support.",
            });
            return
          }
        }
        await t.commit();
        res.send({ message: "Successfully logged the hours" });
      }
      catch (error) {
        console.error(error)
        await t.rollback();
        res.status(500).send({
          message:
            "Some error occurred while creating the transaction. Please contact IT support.",
        });

      }
    }
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

// Delete a Hours with the specified id in the request
exports.delete = (req, res) => {
  // #swagger.tags = ['Hours']
  // #swagger.description = 'Deletes a single hour record with an ID (will be depricated)'
  const id = req.params.id;

  Hours.destroy({
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Hours was deleted successfully!",
        });
      } else {
        res.send({
          message: `Cannot delete Hours with id=${id}. Maybe Hours was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete Hours with id=" + id,
      });
    });
};
// Delete a Hours with the specified id in the request
exports.Bulkdelete = async (req, res) => {
  // #swagger.tags = ['Hours']
  // #swagger.description = 'Deletes a single hour record with an ID (will be depricated)'
  let data = await Hours.findAll({
    where: { Transaction_ID: { [Op.in]: req.body } },
    raw: true
  })
  Hours.destroy({
    where: { Transaction_ID: { [Op.in]: req.body } },
    User: req.headers["useruuid"],
    BeforeData: data
  })
    .then((num) => {
      if (num > 0) {
        res.send({
          message: "Hours was deleted successfully!",
        });
      } else {
        res.send({
          message: `Cannot delete Hours with transaction Id's ${req.body.join('-')}. Maybe the Hours was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: `Could not delete Hours with transaction Id's ${req.body.join('-')}, some error occured, please contact IT.`,
      });
    });
};


exports.sum_by_Month_and_project = async (req, res) => {
  // #swagger.tags = ['Hours']
  // #swagger.description = 'Deletes a single hour record with an ID (will be depricated)'
  const total_meetings = await Hours.findAll({
    where: {
      Date: {
        [Op.between]: [req.params.start, req.params.end],
      },
      Project: {
        [Op.like]: '%' + req.params.project + '%',
      }
    },
    attributes: [[sequelize.fn('sum', sequelize.col('Hours')), 'TotalHours']],
  });
  res.send(total_meetings)
};
// Get sum of hours of the Meetings by user

exports.sum_meetings_by_Month_User = async (req, res) => {
  // #swagger.tags = ['Hours']
  // #swagger.description = 'Sums up meetings booked by a user between two dates.'

  // was: router.get("/Hours/sumMeetings/:param", VerifyToken, hours.sum_meetings_by_Month_User);
  // is:  router.get(`Hours/sum/meetings/user/:UserUUID/start/:date/end/:date`, VerifyToken, hours.sum_meetings_by_Month_User);
  const dateStart = req.params.start;
  const dateEnd = req.params.end;
  const userID = req.params.UserUUID
  Transaction_ID.findAll({
    include: [
      {
        model: Ledger,
        where: {
          Account: userID,
        },
        attributes: []
      },
      {
        model: Hours,
        where: {
          Date: {
            [Op.between]: [dateStart, dateEnd],
          },
        },
        attributes: []
      },

    ],
    group: [
      "Transaction_ID.Transaction_ID", "Ledgers.id", "Ledgers.Account"
    ],
    attributes: ["Ledgers.Account", [sequelize.fn('sum', sequelize.col('Meetings')), 'totalMeeting']],
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
};



// Hours logged by tasks for user_uuid for this salary period + also month.

exports.task_by_Salary_period = async (req, res) => {
  // #swagger.tags = ['Hours']
  // #swagger.description = 'Endpoint para obter um usuário.'

  const params = JSON.parse(req.params.param);
  const salary_period_month = params.salary_period_month;
  const userID = params.User_UUID;;


  var condition = salary_period_month ? { Month_name: { [Op.like]: `%${salary_period_month}%` } } : null;

  const Salary_period = await salary_period.findAll({ where: condition })
  const dateStart = Salary_period[0].Date_start;
  const dateEnd = Salary_period[0].Date_end;


  const total_hours = await Hours.findAll({
    where: {
      Date: {
        [Op.between]: [dateStart, dateEnd],
      },
      User_UUID: {
        [Op.eq]: userID,
      },
      Task: {
        [Op.eq]: "Meetings",
      },
    },
    attributes: [[sequelize.fn('sum', sequelize.col('Hours')), 'totalHours']],

  });

  res.send(total_hours)

};

exports.sum_by_Month = async (req, res) => {
  // #swagger.tags = ['Hours']
  // #swagger.description = 'Sums hours for a user between two dates'
  const dateStart = req.params.start;
  const dateEnd = req.params.end;
  const userID = req.params.UserUUID
  salary_period.findAll({
    where: {
      Date_start: {
        [Op.gte]: dateStart
      },
      Date_end: {
        [Op.lte]: dateEnd
      }
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
  }).then((data) => {
    res.send(data)
  })
    .catch((err) => {
      console.log(err)
      res.status(500).send({
        message: "Error retrieving Hours with id=",
      });
    });;

};

// Average contacts for the month.

exports.average_contacts_Month = async (req, res) => {
  // #swagger.tags = ['Hours']
  // #swagger.description = 'Retrieves avarage contacts for a user between two dates'

  const dateStart = req.params.start;
  const dateEnd = req.params.end;
  const userID = req.params.UserUUID
  Transaction_ID.findAll({
    include: [
      {
        model: Ledger,
        where: {
          Account: userID,
        },
        attributes: []
      },
      {
        model: Hours,
        where: {
          Date: {
            [Op.between]: [dateStart, dateEnd],
          },
          Task: {
            [Op.or]: [
              "Emails", "Calling", "Backoffice",
            ]
          }
        },
        attributes: []
      },
    ],
    group: [
      "Transaction_ID.Transaction_ID", "Ledgers.id", "Ledgers.Account"
    ],
    attributes: ["Ledgers.Account", [sequelize.fn('sum', sequelize.col('Contacts')), 'sumContacts'], [sequelize.fn('sum', sequelize.col('Hours')), 'sumHours']],
    raw: true,
    group: [
      "Ledgers.Account",
    ],
  }).then((data) => {
    const avg = parseFloat(data[0].sumContacts) / parseFloat(data[0].sumHours)
    data[0].avg = avg
    res.send(data)
  })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving Hours with id=",
      });
    });

};


// This controller can be modified a little to return pagination response:

// {
//     "totalItems": 8,
//     "Schedules": [...],
//     "totalPages": 3,
//     "currentPage": 1
// }
//https://bezkoder.com/node-js-sequelize-pagination-mysql/

// /api/Schedules: GET, POST, DELETE
// /api/Schedules/:id: GET, PUT, DELETE
// /api/Schedules/published: GET
