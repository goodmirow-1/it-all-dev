'use strict';
module.exports = (sequelize, DataTypes) => {
  var NotificationList = sequelize.define('NotificationList', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    TargetID: {
      type: DataTypes.INTEGER
    },
    ToParent: {
      type: DataTypes.BOOLEAN,
      defaultValue : true
    },
    Type: {
      type: DataTypes.INTEGER
    },
    SubData: {
      type: DataTypes.STRING
    },
    isSend: {
      type: DataTypes.BOOLEAN,
      defaultValue : false
    },
  }, {});
  NotificationList.associate = function (models) {
  };
  return NotificationList;
};
