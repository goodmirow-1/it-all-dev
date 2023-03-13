'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Students', {
      UserID: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      Number: {
        type: Sequelize.INTEGER
      },
      Email: {
        type: DataTypes.STRING(32),
      },
      Name: {
        type: Sequelize.STRING(16)
      },
      Type: {
        type: Sequelize.INTEGER(1)
      },
      EnterRoot : {
        type: Sequelize.STRING(16)
      },
      PhoneNumber: {
        type: Sequelize.STRING(16)
      },
      Password: {
        type: Sequelize.STRING(128)
      },
      ParentName: {
        type: Sequelize.STRING(16)
      },
      ParentPhoneNumber: {
        type: Sequelize.STRING(16)
      },
      ParentPassword: {
        type: Sequelize.STRING(128)
      },
      Location: {
        type: Sequelize.STRING(128)
      },
      CenterID: {
        type: Sequelize.INTEGER
      },
      ClassID: {
        type: Sequelize.INTEGER
      },
      State: {
        type: Sequelize.INTEGER(4),
        defaultValue : 0
      },
      NowPlace: {
        type: Sequelize.STRING(32),
        defaultValue : '입학전'
      },
      Birthday: {
        type: Sequelize.STRING(32)
      },
      Gender: {
        type: Sequelize.INTEGER(1)
      },
      ClassifyClass: {
        type: Sequelize.INTEGER(1),
        defaultValue : 0
      },
      ExamType: {
        type: Sequelize.STRING(32)
      },
      ExamDetail: {
        type: Sequelize.STRING(128)
      },
      HighSchool: {
        type: Sequelize.STRING(32)
      },
      University: {
        type: Sequelize.STRING(32)
      },
      Target: {
        type: Sequelize.STRING(32)
      },
      Teacher: {
        type: Sequelize.STRING(16)
      },
      WillEnterCounseling: {
        type: Sequelize.STRING(16)
      },
      PeriodStart: {
        type: Sequelize.DATE
      },
      PeriodEnd: {
        type: Sequelize.DATE
      },
      MonthPureStudyTime: {
        type: Sequelize.INTEGER(4),
        defaultValue : 0
      },
      TotalRewardPoint: {
        type: Sequelize.INTEGER(4),
        defaultValue: 0
      },
      ImageURL: {
        type: Sequelize.STRING(45)
      },
      SpecialNote: {
        type: Sequelize.STRING(1024)
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Students');
  }
};