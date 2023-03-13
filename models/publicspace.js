'use strict';
module.exports = (sequelize, DataTypes) => {
  var PublicSpace = sequelize.define('PublicSpace', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    Name: {
      type: DataTypes.STRING
    },
    CenterID: {
      type: DataTypes.INTEGER
    },
    MaxCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    CurrCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
  }, {});
  PublicSpace.associate = function (models) {
    this.belongsTo(models.Center, {
      foreignKey : "CenterID",
      onDelete : "cascade",
    });
  };
  return PublicSpace;
};
