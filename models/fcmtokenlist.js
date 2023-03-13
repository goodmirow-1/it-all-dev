'use strict';
module.exports = (sequelize, DataTypes) => {
  var FcmTokenList = sequelize.define('FcmTokenList', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    UserID: {
      type: DataTypes.INTEGER
    },
    StudentToken: {
      type: DataTypes.STRING
    },
    ParentTokenOne: {
      type: DataTypes.STRING
    },
    ParentTokenTwo: {
      type: DataTypes.STRING
    },
    Alarm: {
      type: DataTypes.BOOLEAN,
      defaultValue : true
    },
    LoginChecker: {
      type: DataTypes.BOOLEAN,
      defaultValue : true
    },
  }, {});
  FcmTokenList.associate = function (models) {
  };
  return FcmTokenList;
};
