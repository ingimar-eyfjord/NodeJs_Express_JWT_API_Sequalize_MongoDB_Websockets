module.exports = (sequelize, Sequelize) => {
  const Locations = sequelize.define(
    "Locations",
    {
      Location: {
        type: Sequelize.STRING(15),
        primaryKey: true,
        unique: true
      },
    },
    {
      freezeTableName: true,
      timestamps: false,
    }
  );
  return Locations;
};
