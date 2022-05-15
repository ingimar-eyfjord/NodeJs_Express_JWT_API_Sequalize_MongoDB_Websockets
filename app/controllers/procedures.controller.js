const Sequelize = require("sequelize");
const { QueryTypes } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(process.env.DB, process.env.USER, process.env.PASSWORD, {
  host: process.env.HOST,
  dialect: process.env.dialect || "mysql",
  port: 3306
});
exports.GetHoursForTheMonth = (req, res) => {
  // #swagger.tags = ["Schedule"]
  // #swagger.description = 'Retrieves the sum og hours scheduled for a team, for a whole month, using the team id and a date.'

  sequelize
    .query("CALL getMonthlyHoursByTeam(:start, :team)", {
      replacements: { start: `${req.params.date}`, team: `${req.params.id}` },
      type: QueryTypes.SELECT,
    })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      console.log(err)
      res.status(500).send({
        message: err,
      });
    });
};

exports.GetMonthlyHours = async (req, res) => {
  // #swagger.tags = ["Schedule"]
  // #swagger.description = 'Retrieves the sum of hours scheduled for every user, for a while month, using date'
  sequelize
    .query("CALL getMonthlyHours(:date)", {
      replacements: { date: `${req.params.date}` },
      type: QueryTypes.SELECT,
    })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err,
      });
    });
};
exports.ExportScheduleMonthlyByTeam = async (req, res) => {
  // #swagger.tags = ["Schedule"]
  // #swagger.description = 'Retrieves all records from the schedule for a team, for a whole month, using the team id and a date.'
  const params = JSON.parse(req.params.params);
  sequelize
    .query("CALL ExportScheduleMonthlyByTeam(:start, :team)", {
      replacements: { start: `${params.start}`, team: `${params.team}` },
      type: QueryTypes.SELECT,
    })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err,
      });
    });
};



exports.GetMonthlyHoursByUserArray = async (req, res) => {
  // #swagger.tags = ["Schedule"]
  // #swagger.description = 'Retrieves the sum of hours scheduled for the month, using an array of usernames and a whatever date.'
  const formatted = req.params.set.map((name) => `'${name}'`);
  sequelize
    .query(
      `SELECT sum(Hours) as "Hours" from Schedule WHERE User IN (${formatted}) AND DATE_FORMAT(Date_start_time,'%Y%m') = DATE_FORMAT('${req.params.start}','%Y%m')`,
      {
        // replacements: { var_user_array: formatted, var_date: `${params.start}` },
        type: QueryTypes.SELECT,
      }
    )
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err,
      });
    });
};
