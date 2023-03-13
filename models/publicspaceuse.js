'use strict';
module.exports = (sequelize, DataTypes) => {
  var PublicSpaceUse = sequelize.define('PublicSpaceUse', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    UserID: {
      type: DataTypes.INTEGER
    },
    PublicSpaceID: {
      type: DataTypes.INTEGER
    },
    TimeScheduleID: {
      type: DataTypes.INTEGER
    },
    Class: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
  }, {});
  PublicSpaceUse.associate = function (models) {
  };
  return PublicSpaceUse;
};
