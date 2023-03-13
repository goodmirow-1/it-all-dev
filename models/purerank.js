'use strict';
module.exports = (sequelize, DataTypes) => {
  var PureRank = sequelize.define('PureRank', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    UserID: {
      type: DataTypes.INTEGER
    },
    CenterID: {
      type: DataTypes.INTEGER
    },
    Rank: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    Time: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
  }, {});
  PureRank.associate = function (models) {
  };
  return PureRank;
};
