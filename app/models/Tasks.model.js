module.exports = (sequelize, Sequelize) => {
  const Tasks = sequelize.define(
    "Task",
    {
      Task: {
        type: Sequelize.STRING(25),
        primaryKey: true,
        unique:true
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

  return Tasks;
};
