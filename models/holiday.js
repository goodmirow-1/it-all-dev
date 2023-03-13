'use strict';
module.exports = (sequelize, DataTypes) => {
  var Holiday = sequelize.define('Holiday', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    Name : {
      type: DataTypes.STRING(32)
    },
    Time: {
      type: DataTypes.DATE,
    },
  }, {});
  Holiday.associate = function (models) {
  };
  return Holiday;
};
