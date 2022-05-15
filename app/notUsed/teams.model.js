module.exports = (sequelize, Sequelize) => {
  const Teams = sequelize.define(
    "Teams",
    {
      Team: {
        type: Sequelize.STRING(255),
        unique: true,
        primaryKey: true,
      },
    },
    {
      freezeTableName: true,
      timestamps: false,
    }
  );
  return Teams;
};
