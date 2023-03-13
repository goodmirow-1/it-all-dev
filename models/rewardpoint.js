'use strict';
module.exports = (sequelize, DataTypes) => {
  var RewardPoint = sequelize.define('RewardPoint', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    UserID: {
      type: DataTypes.INTEGER,
    },
    TargetID: {
      type: DataTypes.INTEGER,
    },
    Reason: {
      type: DataTypes.STRING(512)
    },
    Description: {
      type: DataTypes.STRING(512)
    },
    Value: {
      type: DataTypes.INTEGER(4),
      defaultValue: 0
    },
    Class: {
      type: DataTypes.INTEGER(2),
      defaultValue: 0
    }
  }, {});
  RewardPoint.associate = function (models) {
  };
  return RewardPoint;
};
