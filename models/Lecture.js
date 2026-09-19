import { DataTypes } from "sequelize";

export const initLecture = (sequelize) => {
  return sequelize.define(
    "Lecture",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      courseId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "courses",
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
    },
    {
      tableName: "lectures",
      timestamps: true,
    },
  );
};
