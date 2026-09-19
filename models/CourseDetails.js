import { DataTypes } from "sequelize";

export const initCourseDetails = (sequelize) => {
  return sequelize.define(
    "CourseDetails",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      instructor: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      thumbnail: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      membershipType: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "course_details",
      timestamps: true,
    },
  );
};
