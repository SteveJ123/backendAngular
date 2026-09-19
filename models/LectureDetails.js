import { DataTypes } from "sequelize";

export const initLectureDetails = (sequelize) => {
  return sequelize.define(
    "LectureDetails",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      courseDetailsId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "course_details",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      videoUrl: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      duration: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "lecture_details",
      timestamps: true,
    },
  );
};
