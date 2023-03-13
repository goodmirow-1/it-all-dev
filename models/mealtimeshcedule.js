'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MealTimeShcedule extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  MealTimeShcedule.init({
    CenterID: DataTypes.INTEGER,
    Day: DataTypes.DATE,
    Type: DataTypes.INTEGER,
    Scheudle: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'MealTimeShcedule',
  });
  return MealTimeShcedule;
};