'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Staffs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      Name: {
        type: Sequelize.STRING
      },
      LoginID: {
        type: Sequelize.STRING(32)
      },
      Password: {
        type: Sequelize.STRING
      },
      CenterID: {
        type: Sequelize.INTEGER
      },
      ChargeCenter: {
        type: Sequelize.STRING(1024)
      },
      Gender: {
        type: Sequelize.BOOLEAN,
        defaultValue: 0
      },
      PhoneNumber: {
        type: Sequelize.STRING(32)
      },
      Birthday: {
        type: Sequelize.STRING(32)
      },
      Department: {
        type: Sequelize.STRING(16)
      },
      Type: {
        type: Sequelize.INTEGER
      },
      Position: {
        type: Sequelize.STRING(16)
      },
      SpecialNote: {
        type: Sequelize.STRING(1024)
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
    await queryInterface.dropTable('Staffs');
  }
};