'use strict';
module.exports = (sequelize, DataTypes) => {
  var Seat = sequelize.define('Seat', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    UserID: {
      type: DataTypes.INTEGER
    },
    ClassID: {
      type: DataTypes.INTEGER
    },
    Number: {
      type: DataTypes.STRING(32)
    },
  }, {});
  Seat.associate = function (models) {
    this.belongsTo(models.Student, {
      foreignKey : "UserID",
      onDelete : "cascade",
    });
  };
  return Seat;
};
