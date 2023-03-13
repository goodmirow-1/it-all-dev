'use strict';
module.exports = (sequelize, DataTypes) => {
  var Student = sequelize.define('Student', {
    UserID: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    Number: {
      type: DataTypes.INTEGER
    },
    Name: {
      type: DataTypes.STRING(16)
    },
    Type: {
      type: DataTypes.INTEGER(1)
    },
    EnterRoot : {
      type: DataTypes.STRING(16),
    },
    PhoneNumber: {
      type: DataTypes.STRING(16)
    },
    Password: {
      type: DataTypes.STRING(128)
    },
    ParentName: {
      type: DataTypes.STRING(16)
    },
    ParentPhoneNumber: {
      type: DataTypes.STRING(16)
    },
    ParentPassword: {
      type: DataTypes.STRING(128)
    },
    Location: {
      type: DataTypes.STRING(128)
    },
    CenterID: {
      type: DataTypes.INTEGER
    },
    ClassID: {
      type: DataTypes.INTEGER
    },
    State: {
      type: DataTypes.INTEGER(4),
      defaultValue : 0
    },
    NowPlace: {
      type: DataTypes.STRING(32),
      defaultValue : '입학전'
    },
    Birthday: {
      type: DataTypes.STRING(32)
    },
    Gender: {
      type: DataTypes.INTEGER(1)
    },
    ClassifyClass: {
      type: DataTypes.INTEGER(1),
      defaultValue : 0
    },
    ExamType: {
      type: DataTypes.STRING(32)
    },
    ExamDetail: {
      type: DataTypes.STRING(128)
    },
    HighSchool: {
      type: DataTypes.STRING(32)
    },
    University: {
      type: DataTypes.STRING(32)
    },
    Target: {
      type: DataTypes.STRING(32)
    },
    Teacher: {
      type: DataTypes.STRING(16)
    },
    WillEnterCounseling: {
      type: DataTypes.STRING(16)
    },
    PeriodStart: {
      type: DataTypes.DATE
    },
    PeriodEnd: {
      type: DataTypes.DATE
    },
    MonthPureStudyTime: {
      type: DataTypes.INTEGER(4),
      defaultValue: 0
    },
    TotalRewardPoint: {
      type: DataTypes.INTEGER(4),
      defaultValue: 0
    },
    ImageURL: {
      type: DataTypes.STRING(45)
    },
    SpecialNote: {
      type: DataTypes.STRING(1024)
    },
  }, {});
  Student.associate = function (models) {
    this.belongsTo(models.Center, {
      foreignKey : "CenterID",
      onDelete : "cascade",
    });
    this.hasOne(models.Seat, {
      foreignKey: "UserID",
      onDelete : "cascade",
    });
    this.hasMany(models.Attendance, {
      foreignKey: "UserID",
      onDelete : "cascade",
    });
    this.hasMany(models.Absence, {
      foreignKey: "UserID",
      onDelete : "cascade",
    });
    this.hasMany(models.AbsenceRegular, {
      foreignKey: "UserID",
      onDelete : "cascade",
    });
    this.hasMany(models.PureStudyTime, {
      foreignKey: "UserID",
      onDelete : "cascade",
    });
  };
  return Student;
};
