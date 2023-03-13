'use strict';
module.exports = (sequelize, DataTypes) => {
  var Staff = sequelize.define('Staff', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    Name: {
      type: DataTypes.STRING
    },
    LoginID: {
      type: DataTypes.STRING(32)
    },
    Password: {
      type: DataTypes.STRING
    },
    CenterID: {
      type: DataTypes.INTEGER
    },
    ChargeCenter: {
      type: DataTypes.STRING(1024)
    },
    Gender: {
      type: DataTypes.BOOLEAN,
      defaultValue: 0
    },
    PhoneNumber: {
      type: DataTypes.STRING(32)
    },
    Birthday: {
      type: DataTypes.STRING(32)
    },
    Department: {
      type: DataTypes.STRING(16)
    },
    Type: {
      type: DataTypes.INTEGER(1)
    },
    Position: {
      type: DataTypes.STRING(16)
    },
    SpecialNote: {
      type: DataTypes.STRING(1024)
    },
  }, {});
  Staff.associate = function (models) {
  };
  return Staff;
};
