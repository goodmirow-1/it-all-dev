'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Classes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      CenterID: {
        type: Sequelize.INTEGER
      },
      Name : {
        type: Sequelize.STRING(32)
      },
      Type: {
        type: Sequelize.INTEGER,
        defaultValue : 0
      },
      FloorPlane: {
        type: Sequelize.STRING,
        defaultValue : null
      },
      TimeScheduleID: {
        type: Sequelize.INTEGER,
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
    await queryInterface.dropTable('Classes');
  }
};