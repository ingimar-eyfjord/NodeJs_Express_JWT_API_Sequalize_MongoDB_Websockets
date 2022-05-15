module.exports = (sequelize, Sequelize) => {
  const Forecast = sequelize.define(
    "Forecast",
    {
      id: {
        type: Sequelize.INTEGER(11),
        primaryKey: true,
        autoIncrement: true,
      },
      userID: {
        type: Sequelize.STRING(255),
      },
      month: {
        type: Sequelize.DATE(6),
      },
      hours: {
        type: Sequelize.DECIMAL(62, 2),
      },
    },
    {
      freezeTableName: true,
      timestamps: true,
    }
  );

  return Forecast;
};
