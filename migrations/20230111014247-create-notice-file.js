'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('NoticeFiles', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      NoticeID: {
        type: Sequelize.INTEGER
      },
      FileURL: {
        type: Sequelize.STRING(256)
      },
      Width: {
        type: Sequelize.INTEGER(4)
      },
      Height: {
        type: Sequelize.INTEGER(4)
      },
      IsPhoto: {
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
    await queryInterface.dropTable('NoticeFiles');
  }
};