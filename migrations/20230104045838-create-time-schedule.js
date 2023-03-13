'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('TimeSchedules', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      Name: {
        type: Sequelize.STRING(64)
      },
      CenterID: {
        type: Sequelize.INTEGER
      },
      IsHoliday: {
        type : Sequelize.BOOLEAN,
        defaultValue : false
      },
      EnterTime: {
        type: Sequelize.STRING(32),
        defaultValue : "08:00"
      },
      CloseTime: {
        type: Sequelize.STRING(32),
        defaultValue : "24:00"
      },
      ClassOne: {
        type: Sequelize.STRING(32),
        defaultValue : "08:00~08:40"
      },
      ClassTwo: {
        type: Sequelize.STRING(32),
        defaultValue : "08:50~10:20"
      },
      ClassThree: {
        type: Sequelize.STRING(32),
        defaultValue : "10:30~12:00"
      },
      ClassFour: {
        type: Sequelize.STRING(32),
        defaultValue : "13:10~14:40"
      },
      ClassFive: {
        type: Sequelize.STRING(32),
        defaultValue : "14:50~16:20"
      },
      ClassSix: {
        type: Sequelize.STRING(32),
        defaultValue : "16:30~18:00"
      },
      ClassSeven: {
        type: Sequelize.STRING(32),
        defaultValue : "19:10~20:30"
      },
      ClassEight: {
        type: Sequelize.STRING(32),
        defaultValue : "20:40~21:50"
      },
      ClassNine: {
        type: Sequelize.STRING(32),
        defaultValue : "22:00~23:00"
      },
      ClassTen: {
        type: Sequelize.STRING(32),
        defaultValue : "23:00~24:00"
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
    await queryInterface.dropTable('TimeSchedules');
  }
};