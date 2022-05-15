module.exports = (sequelize, Sequelize) => {
    const Preferences = sequelize.define(
      "Preferences",
      {
        userUID: {
          type: Sequelize.STRING(255),
          primaryKey: true,
        },
        CardElements: {
          type: Sequelize.JSON,
        },
        CardElements: {
            type: Sequelize.JSON,
        },
      },
      {
        freezeTableName: true,
        timestamps: false,
      }
    );
  
    return Preferences;
  };
  