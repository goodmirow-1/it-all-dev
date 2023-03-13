'use strict';
module.exports = (sequelize, DataTypes) => {
  var Center = sequelize.define('Center', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    Name: {
      type: DataTypes.STRING(64)
    },
    Site: {
      type: DataTypes.STRING(128)
    },
    TelephoneNumber : {
      type: DataTypes.STRING(32),
    },
    Location : {
      type: DataTypes.STRING,
    },
    Type: {
      type: DataTypes.INTEGER(1),
      defaultValue : 0
    },
    PublicSpaceCount : {
      type: DataTypes.INTEGER(4),
      defaultValue : 1
    },
    StudentTempPassword: {
      type: DataTypes.STRING(128),
      defaultValue : "ialS"
    },
    ParentTempPassword: {
      type: DataTypes.STRING(128),
      defaultValue : "ialP"
    },
    StaffTempPassword: {
      type: DataTypes.STRING(128),
      defaultValue : "itaS"
    },
    IsOpen: {
      type: DataTypes.BOOLEAN,
      defaultValue : true
    }
  }, {});
  Center.associate = function (models) {
    this.hasMany(models.Student, {
      foreignKey: 'CenterID'
    });
    this.hasMany(models.Class, {
      foreignKey: 'CenterID'
    });
    this.hasMany(models.TimeSchedule, {
      foreignKey: 'CenterID'
    });
    this.hasMany(models.PublicSpace, {
      foreignKey: 'CenterID'
    })
  };
  return Center;
};
