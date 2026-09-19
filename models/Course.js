import { DataTypes } from "sequelize";

export const initCourse = (sequelize) => {
  return sequelize.define(
    "Course",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: DataTypes.ENUM("Face Yoga", "Face Yoga + Raj Yoga"),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      instructor: {
        type: DataTypes.STRING,
        defaultValue: "Pooja Agarwala",
      },
      thumbnail: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      progress: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
        validate: {
          min: 0,
          max: 100,
        },
      },
      status: {
        type: DataTypes.ENUM("in_progress", "completed", "not_started"),
        defaultValue: "not_started",
      },
      isPaid: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isNewCourse: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      language: {
        type: DataTypes.ENUM("English", "Telugu"),
        allowNull: false,
      },
    },
    {
      tableName: "courses",
      timestamps: true,
      indexes: [
        {
          fields: ["language"],
        },
      ],
    },
  );
};
