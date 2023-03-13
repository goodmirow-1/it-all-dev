'use strict';
module.exports = (sequelize, DataTypes) => {
  var Class = sequelize.define('Class', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    CenterID: {
      type: DataTypes.INTEGER
    },
    TimeScheduleID: {
      type: DataTypes.INTEGER,
    },
    Name : {
      type: DataTypes.STRING(32)
    },
    Type: {
      type: DataTypes.INTEGER(1),
      defaultValue : 0
    },
    FloorPlane: {
      type: DataTypes.STRING(2048),
      defaultValue : null
    },
  }, {});
  Class.associate = function (models) {
    this.belongsTo(models.Center, {
      foreignKey : "CenterID",
      onDelete : "cascade",
    });
  };
  return Class;
};
