module.exports = (sequelize, Sequelize) => {
  const Transaction_type = sequelize.define(
    "Transaction_type",
    {
      Type: {
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

  return Transaction_type;
};
