
'use strict';
module.exports = (sequelize, DataTypes) => {
  var NoticeFile = sequelize.define('NoticeFile', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    NoticeID: {
      type: DataTypes.INTEGER
    },
    FileURL: {
      type: DataTypes.STRING(256)
    },
    Width: {
      type: DataTypes.INTEGER(4)
    },
    Height: {
      type: DataTypes.INTEGER(4)
    },
    IsPhoto: {
      type: DataTypes.BOOLEAN,
      defaultValue: 0
    },
  }, {});
  NoticeFile.associate = function (models) {
    this.belongsTo(models.Notice, {
      foreignKey: 'NoticeID',
      onDelete : "cascade",
    });
  };
  return NoticeFile;
};
