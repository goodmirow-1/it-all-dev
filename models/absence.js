'use strict';
module.exports = (sequelize, DataTypes) => {
  var Absence = sequelize.define('Absence', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    UserID: {
      type: DataTypes.INTEGER,
    },
    Type: {
      type: DataTypes.INTEGER(4),
      defaultValue : 0
    },
    PeriodStart: {
      type: DataTypes.DATE
    },
    PeriodEnd: {
      type: DataTypes.DATE
    },
    Reason: {
      type: DataTypes.STRING(512)
    },
    WithVacation: {
      type: DataTypes.BOOLEAN,
      defaultValue : false
    },
    Acception: {
      type: DataTypes.BOOLEAN,
    },
  }, {});
  Absence.associate = function (models) {
    this.belongsTo(models.Student, {
      foreignKey : "UserID",
      onDelete : "cascade",
    });
  };
  return Absence;
};
