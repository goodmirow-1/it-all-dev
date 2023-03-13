'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('EnterCounselingForms', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      UserID : {
        type : Sequelize.INTEGER,
      },
      CenterID : {
        type : Sequelize.INTEGER,
      },
      Service: {
        type: Sequelize.INTEGER(1),
        defaultValue : 0
      },
      Name: {
        type: Sequelize.STRING(16)
      },
      Birthday: {
        type: Sequelize.STRING(16)
      },
      Gender: {
        type: Sequelize.INTEGER(1)
      },
      PhoneNumber: {
        type: Sequelize.STRING(16)
      },
      ParentPhoneNumber: {
        type: Sequelize.STRING(16)
      },
      Location: {
        type: Sequelize.STRING(32)
      },
      HighSchool: {
        type: Sequelize.STRING(32)
      },
      University: {
        type: Sequelize.STRING(32)
      },
      WillAttendance: {
        type: Sequelize.DATE
      },
      Target: {
        type: Sequelize.STRING(32)
      },
      TeacherCounseling: {
        type: Sequelize.BOOLEAN,
        defaultValue : true
      },
      CurriculumCounseling: {
        type: Sequelize.BOOLEAN,
        defaultValue : true
      },
      WeeklyTest: {
        type: Sequelize.STRING(128)
      },
      Previous: {
        type: Sequelize.STRING(32)
      },
      Path: {
        type: Sequelize.STRING(64)
      },
      ETC: {
        type: Sequelize.STRING(128)
      },
      Agree: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
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
    await queryInterface.dropTable('EnterCounselingForms');
  }
};