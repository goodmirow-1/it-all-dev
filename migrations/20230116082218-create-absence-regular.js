'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('AbsenceRegulars', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      UserID: {
        type: Sequelize.INTEGER
      },
      Type: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      PeriodStart: {
        type: Sequelize.STRING
      },
      PeriodEnd: {
        type: Sequelize.STRING
      },
      Reason: {
        type: Sequelize.STRING
      },
      Monday: {
        type: Sequelize.BOOLEAN,
        defaultValue : false
      },
      Tuseday: {
        type: Sequelize.BOOLEAN,
        defaultValue : false
      },
      Wednesday: {
        type: Sequelize.BOOLEAN,
        defaultValue : false
      },
      Thursday: {
        type: Sequelize.BOOLEAN,
        defaultValue : false
      },
      Friday: {
        type: Sequelize.BOOLEAN,
        defaultValue : false
      },
      Saturday: {
        type: Sequelize.BOOLEAN,
        defaultValue : false
      },
      Sunday: {
        type: Sequelize.BOOLEAN,
        defaultValue : false
      },
      Acception: {
        type: Sequelize.BOOLEAN
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
    await queryInterface.dropTable('AbsenceRegulars');
  }
};