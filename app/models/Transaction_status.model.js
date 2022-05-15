module.exports = (sequelize, Sequelize) => {
    const Transaction_status = sequelize.define(
      "Transaction_status",
      {
        Status: {
          type: Sequelize.STRING(255),
          primaryKey: true,
          unique: true
        },
      },
      {
        freezeTableName: true,
        timestamps: false,
      }
    );
  
    return Transaction_status;
  };
  