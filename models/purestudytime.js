'use strict';
module.exports = (sequelize, DataTypes) => {
  var PureStudyTime = sequelize.define('PureStudyTime', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    UserID: {
      type: DataTypes.INTEGER,
    },
    Time: {
      type: DataTypes.INTEGER,
      defaultValue : 0
    },
    State: {
      type: DataTypes.INTEGER(1),
      defaultValue : 1
    },
  }, {});
  PureStudyTime.associate = function (models) {
  };
  return PureStudyTime;
};
