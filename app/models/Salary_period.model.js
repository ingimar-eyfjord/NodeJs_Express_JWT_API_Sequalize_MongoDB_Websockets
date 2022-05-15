module.exports = (sequelize, Sequelize) => {
    const Salary_period = sequelize.define(
      "Salary_period",
      {
        id: {
          type: Sequelize.INTEGER(255),
          primaryKey: true,
          autoIncrement: true,
        },
        Date_start: {
          type: Sequelize.DATE,
        },
        Date_end: {
          type: Sequelize.DATE,
        },
        Month_name: {
          type: Sequelize.STRING(255),
        }
      },
      {
        freezeTableName: true,
        timestamps: false,
      }
    );
    return Salary_period;
  };
  