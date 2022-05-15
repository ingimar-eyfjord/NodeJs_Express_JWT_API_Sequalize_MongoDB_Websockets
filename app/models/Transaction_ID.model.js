module.exports = (sequelize, Sequelize) => {
    const Transaction_ID = sequelize.define(
      "Transaction_ID",
      {
        Transaction_ID: {
            type: Sequelize.INTEGER(255),
            primaryKey: true,
            autoIncrement: true,
            noUpdate : true,
        },
      },
      {
        freezeTableName: true,
        timestamps: false,
      }
    );
  
    return Transaction_ID;
  };
  