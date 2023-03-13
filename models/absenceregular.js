'use strict';
module.exports = (sequelize, DataTypes) => {
  var AbsenceRegular = sequelize.define('AbsenceRegular', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    UserID: {
      type: DataTypes.INTEGER
    },
    Type: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    PeriodStart: {
      type: DataTypes.STRING
    },
    PeriodEnd: {
      type: DataTypes.STRING
    },
    Reason: {
      type: DataTypes.STRING
    },
    Monday: {
      type: DataTypes.BOOLEAN,
      defaultValue : false
    },
    Tuseday: {
      type: DataTypes.BOOLEAN,
      defaultValue : false
    },
    Wednesday: {
      type: DataTypes.BOOLEAN,
      defaultValue : false
    },
    Thursday: {
      type: DataTypes.BOOLEAN,
      defaultValue : false
    },
    Friday: {
      type: DataTypes.BOOLEAN,
      defaultValue : false
    },
    Saturday: {
      type: DataTypes.BOOLEAN,
      defaultValue : false
    },
    Sunday: {
      type: DataTypes.BOOLEAN,
      defaultValue : false
    },
    Acception: {
      type: DataTypes.BOOLEAN
    },
  }, {});
  AbsenceRegular.associate = function (models) {
    this.belongsTo(models.Student, {
      foreignKey : "UserID",
      onDelete : "cascade",
    });
  };
  return AbsenceRegular;
};
