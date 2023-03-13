'use strict';
module.exports = (sequelize, DataTypes) => {
  var EnterCounselingForm = sequelize.define('EnterCounselingForm', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    UserID : {
      type : DataTypes.INTEGER,
    },
    CenterID : {
      type : DataTypes.INTEGER,
    },
    Service: {
      type: DataTypes.INTEGER(1),
      defaultValue : 0
    },
    Name: {
      type: DataTypes.STRING(16)
    },
    Birthday: {
      type: DataTypes.STRING(16)
    },
    Gender: {
      type: DataTypes.INTEGER(1)
    },
    PhoneNumber: {
      type: DataTypes.STRING(16)
    },
    ParentPhoneNumber: {
      type: DataTypes.STRING(16)
    },
    Location: {
      type: DataTypes.STRING(32)
    },
    HighSchool: {
      type: DataTypes.STRING(32)
    },
    University: {
      type: DataTypes.STRING(32)
    },
    WillAttendance: {
      type: DataTypes.DATE
    },
    Target: {
      type: DataTypes.STRING(32)
    },
    TeacherCounseling: {
      type: DataTypes.BOOLEAN,
      defaultValue : true
    },
    CurriculumCounseling: {
      type: DataTypes.BOOLEAN,
      defaultValue : true
    },
    WeeklyTest: {
      type: DataTypes.STRING(128)
    },
    Previous: {
      type: DataTypes.STRING(32)
    },
    Path: {
      type: DataTypes.STRING(64)
    },
    ETC: {
      type: DataTypes.STRING(128)
    },
    Agree: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
  }, {});
  EnterCounselingForm.associate = function (models) {
    this.belongsTo(models.Student, {
      foreignKey : "UserID",
      onDelete : "cascade",
    });
  };
  return EnterCounselingForm;
};
