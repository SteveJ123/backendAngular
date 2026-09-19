import { DataTypes } from "sequelize";

export const initNutrition = (sequelize) => {
  return sequelize.define(
    "Nutrition",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: "Title is required" },
        },
      },
      category: {
        type: DataTypes.ENUM("nutritiousFood", "healthyDrink"),
        allowNull: false,
      },
      language: {
        type: DataTypes.ENUM("English", "Telugu"),
        defaultValue: "Telugu",
      },
      imageUrl: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: "Image URL is required" },
        },
      },
      ingredients: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: { msg: "Ingredients are required" },
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: { msg: "Description is required" },
        },
      },
    },
    {
      tableName: "nutritions",
      timestamps: true, // Auto-handles createdAt and updatedAt
      updatedAt: false, // Disables updatedAt if you only want createdAt behavior from Mongoose
    },
  );
};
