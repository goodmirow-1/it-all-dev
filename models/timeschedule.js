'use strict';
module.exports = (sequelize, DataTypes) => {
  var TimeSchedule = sequelize.define('TimeSchedule', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    Name: {
      type: DataTypes.STRING(32)
    },
    CenterID: {
      type: DataTypes.INTEGER
    },
    IsHoliday: {
      type: DataTypes.BOOLEAN,
      defaultValue : false
    },
    EnterTime: {
      type: DataTypes.STRING(32),
      defaultValue : "08:00"
    },
    CloseTime: {
      type: DataTypes.STRING(32),
      defaultValue : "22:00"
    },
    ClassOne: {
      type: DataTypes.STRING(32),
      defaultValue : "08:00~08:40"
    },
    ClassTwo: {
      type: DataTypes.STRING(32),
      defaultValue : "08:50~10:20"
    },
    ClassThree: {
      type: DataTypes.STRING(32),
      defaultValue : "10:30~12:00"
    },
    ClassFour: {
      type: DataTypes.STRING(32),
      defaultValue : "13:10~14:40"
    },
    ClassFive: {
      type: DataTypes.STRING(32),
      defaultValue : "14:50~16:20"
    },
    ClassSix: {
      type: DataTypes.STRING(32),
      defaultValue : "16:30~18:00"
    },
    ClassSeven: {
      type: DataTypes.STRING(32),
      defaultValue : "19:10~20:30"
    },
    ClassEight: {
      type: DataTypes.STRING(32),
      defaultValue : "20:40~21:50"
    },
    ClassNine: {
      type: DataTypes.STRING(32),
      defaultValue : "22:00~23:00"
    },
    ClassTen: {
      type: DataTypes.STRING(32),
      defaultValue : "23:00~24:00"
    },
  }, {});
  TimeSchedule.associate = function (models) {
    this.belongsTo(models.Center, {
      foreignKey : "CenterID",
      onDelete : "cascade",
    });
  };
  return TimeSchedule;
};
