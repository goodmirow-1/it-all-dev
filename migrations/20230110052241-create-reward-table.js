'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('RewardTables', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      Category: {
        type: Sequelize.STRING
      },
      Reason: {
        type: Sequelize.STRING
      },
      Type: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      Value: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      IsAuto: {
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
    await queryInterface.dropTable('RewardTables');
  }
};