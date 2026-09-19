import { DataTypes } from "sequelize";

export const initEvent = (sequelize) => {
  return sequelize.define(
    "Event",
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
          notEmpty: {
            msg: "Event title is required",
          },
        },
      },
      imageUrl: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Event image URL is required",
          },
        },
      },
      language: {
        type: DataTypes.ENUM("English", "Telugu"),
        allowNull: false,
        defaultValue: "English",
      },
    },
    {
      tableName: "events",
      timestamps: true,
    },
  );
};
