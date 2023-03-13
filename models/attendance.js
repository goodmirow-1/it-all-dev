'use strict';
module.exports = (sequelize, DataTypes) => {
  var Attendance = sequelize.define('Attendance', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    UserID: {
      type: DataTypes.INTEGER,
    },
    CenterID: {
      type: DataTypes.INTEGER
    },
    Type: {
      type: DataTypes.INTEGER(4),
      defaultValue : 0
    },
    Description: {
      type: DataTypes.STRING
    },
    Time: {
      type: DataTypes.DATE
    },
  }, {});
  Attendance.associate = function (models) {
    this.belongsTo(models.Student, {
      foreignKey : "UserID",
      onDelete : "cascade",
    });
  };
  return Attendance;
};
