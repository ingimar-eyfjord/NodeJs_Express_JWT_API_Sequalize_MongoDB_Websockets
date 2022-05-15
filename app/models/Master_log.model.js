module.exports = (sequelize, Sequelize) => {
    const Master_log = sequelize.define(
      "Master_log",
      {
        id: {
            type: Sequelize.INTEGER(255),
            primaryKey: true,
            autoIncrement: true,
            noUpdate : true
        },
        Account: {
            type: Sequelize.STRING(255),
            allowNull: false,
            noUpdate : true
        },
        Type: {
            type: Sequelize.STRING(255),
            allowNull: false,
            noUpdate : true
          },
        Table:{
            type: Sequelize.STRING(255),
            allowNull: false,
            noUpdate : true 
        },
        Transaction_ID: {
            type: Sequelize.INTEGER(255),
            allowNull: false,
            noUpdate : true
        },
      },
      {
        freezeTableName: true,
        timestamps: true,
      }
    );
    return Master_log;
  };
  