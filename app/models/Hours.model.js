var moment = require('moment-timezone');
module.exports = (sequelize, Sequelize, Salary_period) => {
  const Hours = sequelize.define(
    "Hours",
    {
      id: {
        type: Sequelize.INTEGER(255),
        primaryKey: true,
        autoIncrement: true,
        noUpdate : true
    },
      Date: {
        type: Sequelize.DATEONLY(),
        allowNull: false
      },
      Project: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      Task: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      Description: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      Team: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      Contacts: {
        type: Sequelize.INTEGER(6),
      },
      Meetings: {
        type: Sequelize.INTEGER(6),
      },
      Transaction_ID: {
        type: Sequelize.INTEGER(255),
        unique: true,
        noUpdate : true,
    },
    },
    {
      freezeTableName: true,
      timestamps: true,        
      validate: {
        async  makeSureInCurrentPeriod() {
          const date = new Date()
          let period = await Salary_period.findAll({
            where: {
              [Sequelize.Op.and]: {
                "Date_start": {
                  [Sequelize.Op.lte]: date,
                },
                "Date_end": {
                  [Sequelize.Op.gte]: date
                }
              }
            }, raw:true
          })
          period = period[0]
              if(!period){
                throw new Error('Salary period not found, please inform Admin to make new period');
              }
               if(! moment(moment(this.Date)).isBetween(moment.utc(period.Date_start).startOf("day") ,moment.utc(period.Date_end).endOf("day"))){
                throw new Error('Cannot log hours outside of current salary period');
              }
          },
  }
    }
  );

  return Hours;
};
