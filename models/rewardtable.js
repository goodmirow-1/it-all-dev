
'use strict';
module.exports = (sequelize, DataTypes) => {
  var RewardTable = sequelize.define('RewardTable', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    Category: {
      type: DataTypes.STRING
    },
    Reason: {
      type: DataTypes.STRING
    },
    Type: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    Value: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    IsAuto: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {});
  RewardTable.associate = function (models) {
  };
  return RewardTable;
};
