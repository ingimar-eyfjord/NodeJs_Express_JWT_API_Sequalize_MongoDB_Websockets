module.exports = (sequelize, Sequelize) => {
    const Ledger = sequelize.define(
        "Ledger",
        {
            id: {
                type: Sequelize.INTEGER(255),
                primaryKey: true,
                autoIncrement: true,
                noUpdate: true
            },
            Account: {
                type: Sequelize.STRING(255),
                allowNull: false,
                noUpdate: true
            },
            Salary_period: {
                type: Sequelize.INTEGER(255),
                allowNull: false,
                noUpdate: true
            },
            Type: {
                type: Sequelize.STRING(255),
                allowNull: false,
                noUpdate: true
            },
            Status: {
                type: Sequelize.STRING(255),
                allowNull: false,
                noUpdate: true
            },
            Debit: {
                type: Sequelize.INTEGER(2),
                allowNull: false,
                noUpdate: true
            },
            Credit: {
                type: Sequelize.INTEGER(2),
                allowNull: false,
                noUpdate: true
            },
            Hours: {
                type: Sequelize.DECIMAL(62, 2),
                allowNull: false,
                noUpdate: true
            },
            Transaction_ID: {
                type: Sequelize.INTEGER(255),
                allowNull: false,
                noUpdate: true
            },

        },
        {
            freezeTableName: true,
            timestamps: true,
            paranoid: true,

        }
    );
    return Ledger;
};
