'use strict';
module.exports = (sequelize, DataTypes) => {
  var Notice = sequelize.define('Notice', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    CenterID : {
      type: DataTypes.INTEGER
    },
    TargetCenter: {
      type: DataTypes.STRING
    },
    Title: {
      type: DataTypes.STRING
    },
    Contents: {
      type: DataTypes.STRING
    },
    Type: {
      type: DataTypes.INTEGER(1),
      defaultValue : 0
    },
    ShowDay: {
      type: DataTypes.DATE
    },
    IsShow : {
      type: DataTypes.BOOLEAN,
      defaultValue: 0
    }
  }, {});
  Notice.associate = function (models) {
    this.hasMany(models.NoticeFile, {
      foreignKey: 'NoticeID'
    });
  };
  return Notice;
};
