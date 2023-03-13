'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Absences', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      UserID: {
        type: Sequelize.INTEGER,
      },
      Type: {
        type: Sequelize.INTEGER(4),
        defaultValue: 0
      },
      PeriodStart: {
        type: Sequelize.DATE
      },
      PeriodEnd: {
        type: Sequelize.DATE
      },
      Reason: {
        type: Sequelize.STRING(512)
      },
      WithVacation: {
        type: Sequelize.BOOLEAN,
        defaultValue : false
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
    await queryInterface.dropTable('Absences');
  }
};