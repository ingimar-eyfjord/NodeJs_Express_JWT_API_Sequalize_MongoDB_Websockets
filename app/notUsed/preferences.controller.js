const db = require("../models/index.js");
const Preferences = db.preferences;
const Op = db.Sequelize.Op;
const { QueryTypes } = require("sequelize");
const Sequelize = require("sequelize");
const sequelize = new Sequelize(process.env.DB, process.env.USER, process.env.PASSWORD, {
  host: process.env.HOST,
  dialect: process.env.dialect || "mysql",
});

exports.cardElements = (req, res) => {
  const params = JSON.parse(req.params.params);
  Preferences.findAll({
      where: {
        userUID: {
            [Op.eq]: params.userUID,
        },
      }
    })
      .then((data) => {
        res.send(data);
      })
      .catch((err) => {
        console.log(err)
        res.status(500).send({
          message: "Error retrieving Schedule with id=" + req.params.day,
        });
      });
  };

  exports.CardElementsPreference = async (req, res) => {
    const params = JSON.parse(req.params.params);
    try {
      sequelize.query("INSERT INTO `Preferences` (userUID,CardElements,Other) VALUES ($userUID, $CardJSON, $Other) ON DUPLICATE KEY UPDATE `CardElements` = $CardJSON;", {
          bind: { userUID: `${params.userUID}`, CardJSON: `${JSON.stringify(params.CardElements)}`, Other: `${JSON.stringify(params.Other)}`},
          raw:true,
          type: QueryTypes.INSERT,
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
    } catch (error) {
      console.log("there's an error", error)
    }
  };

