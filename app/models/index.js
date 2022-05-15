const { models } = require("mongoose");
const { Sequelize } = require("sequelize");
require("dotenv").config();
const db = {};

const sequelize = new Sequelize(process.env.DB, process.env.USER, process.env.PASSWORD, {
  host: process.env.HOST,
  dialect: process.env.dialect || "mysql",
  port: 3306,
  hooks: {
    beforeBulkDestroy: (options) => {
      if (options.User) {
        if(options.BeforeData.length > 0){
          for (const e of options.BeforeData){
            const data = {
              Account: options.User,
              Type: "deleted",
              Table: options.model.name,
              Transaction_ID: e.Transaction_ID,
            }
            db.Master_log.create(data)
          }
        }else{
          const data = {
            Account: options.User,
            Type: "deleted",
            Table: options.model.name,
            Transaction_ID: options.BeforeData.Transaction_ID,
          }
          db.Master_log.create(data)
        }
      }
    },
    beforeCreate: (model, options) => {
      // do stuff(model, options) {
      if (options.User) {
        const data = {
          Account: options.User,
          Type: "logged",
          Table: model.constructor.name,
          Transaction_ID: model.dataValues.Transaction_ID,
        }
        if(options.transaction){
          db.Master_log.create(data, {transaction: options.transaction})
        }else{
          db.Master_log.create(data)

        }
      }
    },
    beforeUpdate: (instance, options) => {
        // do stuff(model, options) {
          if (options.User) {
            const data = {
              Account: options.User,
              Type: "edited",
              Table: instance.constructor.name,
              Transaction_ID: instance.dataValues.Transaction_ID,
            }
            db.Master_log.create(data)
          }
        
    }
  }
});
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.salary_period = require("./Salary_period.model.js")(sequelize, Sequelize);
db.schedule = require("./Schedule.model.js")(sequelize, Sequelize);
db.hours = require("./Hours.model.js")(sequelize, Sequelize, db.salary_period);
db.projects = require("./Projects.model.js")(sequelize, Sequelize);
db.tasks = require("./Tasks.model.js")(sequelize, Sequelize);
db.Transaction_type = require("./Transaction_type.model.js")(sequelize, Sequelize);
db.locations = require("./Locations.model.js")(sequelize, Sequelize);
db.ledger = require("./Ledger.model.js")(sequelize, Sequelize);
db.photo = require("./Photo.model.js")(sequelize, Sequelize);
db.Transaction_status = require("./Transaction_status.model.js")(sequelize, Sequelize);
db.Transaction_ID = require("./Transaction_ID.model.js")(sequelize, Sequelize);
db.Master_log = require("./Master_log.model.js")(sequelize, Sequelize);
db.refreshToken = require("./RefreshToken.model.js")(sequelize, Sequelize);


db.projects.hasMany(db.hours, { foreignKey: 'Project' })
db.tasks.hasMany(db.hours, { foreignKey: 'Task' })
db.Transaction_type.hasMany(db.ledger, { foreignKey: 'Type' })
db.Transaction_status.hasMany(db.ledger, { foreignKey: 'Status' })
db.salary_period.hasMany(db.ledger, { foreignKey: 'Salary_period' })
db.Transaction_ID.hasOne(db.hours, { foreignKey: 'Transaction_ID' })
db.Transaction_ID.hasOne(db.schedule, { foreignKey: 'Transaction_ID' })
db.Transaction_ID.hasMany(db.Master_log, { foreignKey: 'Transaction_ID' })
db.Transaction_ID.hasMany(db.ledger, { foreignKey: 'Transaction_ID' })
db.ROLES = ["user", "admin"];
module.exports = db;




// sequelize.sync({ alter: true, match: /_dev_try$/ });
// db.hours.hasMany(db.ledger, { foreignKey: 'Transaction_ID' })