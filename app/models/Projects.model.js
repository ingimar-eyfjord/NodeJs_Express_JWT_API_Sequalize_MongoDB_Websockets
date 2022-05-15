module.exports = (sequelize, Sequelize) => {
  const Projects = sequelize.define(
    "Projects",
    {
      Project: {
        type: Sequelize.STRING(255),
        unique: true,
        primaryKey: true,
      },
      Belongs_to:{
        type: Sequelize.STRING(255),
        allowNull: true,
        get(val) {
          if(val !== null){
            try {
            return this.getDataValue('Belongs_to').split(';')
            } catch (error) {
              return this.getDataValue('Belongs_to')
            }
          }
        },
        set(val) {
          if(val !== null){
           this.setDataValue('Belongs_to',val.join(';'));
           //https://sequelize.org/master/manual/getters-setters-virtuals.html
          }
        },
      },
      Assigned_to:{
        type: Sequelize.STRING(255),
        allowNull: true,
        get(val) {
          if(val !== null){
            try {
            return this.getDataValue('Assigned_to').split(';')
            } catch (error) {
              return this.getDataValue('Assigned_to')
            }
          }
        },
        set(val) {
          if(val !== null){
            this.setDataValue('Assigned_to',val.join(';'));
          }
           //https://sequelize.org/master/manual/getters-setters-virtuals.html
        },
      }
    },
    {
      freezeTableName: true,
      timestamps: false,
    }
  );

  return Projects;
};
