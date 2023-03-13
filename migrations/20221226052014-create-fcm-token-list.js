'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('FcmTokenLists', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      UserID: {
        type: Sequelize.INTEGER
      },
      PhoneNumber: {
        type: Sequelize.STRING
      },
      Token: {
        type: Sequelize.STRING
      },
      ParentTokenOne: {
        type: Sequelize.STRING
      },
      ParentTokenTwo: {
        type: Sequelize.STRING
      },
      Alarm: {
        type: Sequelize.BOOLEAN,
        defaultValue : true
      },
      LoginChecker: {
        type: Sequelize.BOOLEAN,
        defaultValue : true
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
    await queryInterface.dropTable('FcmTokenLists');
  }
};