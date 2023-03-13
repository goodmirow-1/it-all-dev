'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Centers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      Name: {
        type: Sequelize.STRING(64)
      },
      Site: {
        type: Sequelize.STRING(128)
      },
      TelephoneNumber : {
        type: Sequelize.STRING(32),
      },
      Location : {
        type: Sequelize.STRING,
      },
      Type: {
        type: Sequelize.INTEGER(1),
        defaultValue : 0
      },
      PublicSpaceCount : {
        type: Sequelize.INTEGER(4),
        defaultValue : 1
      },
      StudentTempPassword: {
        type: Sequelize.STRING(128),
        defaultValue : "ialS"
      },
      ParentTempPassword: {
        type: Sequelize.STRING(128),
        defaultValue : "ialP"
      },
      StaffTempPassword: {
        type: Sequelize.STRING(128),
        defaultValue : "itaS"
      },
      IsOpen: {
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
    await queryInterface.dropTable('Centers');
  }
};