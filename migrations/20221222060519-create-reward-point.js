'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('RewardPoints', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      UserID: {
        type: Sequelize.INTEGER,
      },
      TargetID: {
        type: Sequelize.INTEGER,
      },
      Reason: {
        type: Sequelize.STRING(512)
      },
      Description: {
        type: Sequelize.STRING(512)
      },
      Value: {
        type: Sequelize.INTEGER(4)
      },
      Class: {
        type: Sequelize.INTEGER(2)
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
    await queryInterface.dropTable('RewardPoints');
  }
};