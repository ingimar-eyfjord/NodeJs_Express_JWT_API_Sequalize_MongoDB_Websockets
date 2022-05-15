module.exports = (sequelize, Sequelize) => {
    const Photos = sequelize.define(
        "Photos",
        {
            id: {
                type: Sequelize.INTEGER(255),
                primaryKey: true,
                autoIncrement: true,
            },
            User_UUID: { 
                type: Sequelize.STRING(255),
            },
            Email: {
                type: Sequelize.STRING(255),
            },
            Profile_Photo: {
                type: Sequelize.TEXT('long'),
            },

        },
        {
            freezeTableName: true,
            timestamps: false,
        }
    );
    return Photos;
};
