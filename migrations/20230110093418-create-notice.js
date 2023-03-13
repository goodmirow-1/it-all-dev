'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Notices', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      CenterID : {
        type: Sequelize.INTEGER
      },
      TargetCenter: {
        type: Sequelize.STRING
      },
      Title: {
        type: Sequelize.STRING
      },
      Contents: {
        type: Sequelize.STRING
      },
      Type: {
        type: Sequelize.INTEGER(1),
        defaultValue : 0
      },
      ShowDay: {
        type: Sequelize.DATE
      },
      IsShow : {
        type: Sequelize.BOOLEAN,
        defaultValue: 0
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
    await queryInterface.dropTable('Notices');
  }
};