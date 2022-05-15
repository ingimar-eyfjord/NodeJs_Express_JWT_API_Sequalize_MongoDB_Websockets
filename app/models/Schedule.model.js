const { Transaction_ID } = require(".");

module.exports = (sequelize, Sequelize) => {
  const Schedule = sequelize.define(
    "Schedule",
    {
      id: {
        type: Sequelize.INTEGER(255),
        primaryKey: true,
        autoIncrement: true,
      },
      Date_start_time: {
        type: Sequelize.DATE(6),
        allowNull: false
      },
      Date_end_time: {
        type: Sequelize.DATE(6),
        allowNull: false
      },
      Hours: {
        type: Sequelize.DECIMAL(62, 2),
        allowNull: false
      },
      Email: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      Team: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      Location: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      Table_number: {
        type: Sequelize.INTEGER(11),
        allowNull: true
      },
      Break: {
        type: Sequelize.INTEGER(1),
        allowNull: false
      },
      User_UUID:{
        type: Sequelize.STRING(255),
        allowNull: false
      },
      Transaction_ID:{
        type: Sequelize.INTEGER(255),
        unique: true,
        noUpdate : true,
      },
    },
    {
      freezeTableName: true,
      timestamps: true,
      paranoid: true

    }
  );

  return Schedule;
};
