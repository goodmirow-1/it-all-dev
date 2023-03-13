'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MealUse extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  MealUse.init({
    UserID: DataTypes.INTEGER,
    UseDay: DataTypes.STRING,
    Type : DataTypes.INTEGER,
    State : DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'MealUse',
  });
  return MealUse;
};