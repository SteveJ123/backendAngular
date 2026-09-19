import { DataTypes } from "sequelize";

export const initLiveSession = (sequelize) => {
  return sequelize.define(
    "LiveSession",
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
      date: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      startTime: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      endTime: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      occurrence: {
        type: DataTypes.STRING,
        defaultValue: "",
      },
      linkTypeNote: {
        type: DataTypes.STRING,
        defaultValue: "(Zoom Meeting - recurring fixed link)",
      },
      meetingUrl: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      courseType: {
        type: DataTypes.ENUM("Face Yoga", "Face Yoga + Raj Yoga"),
        allowNull: false,
        defaultValue: "Face Yoga",
      },
      language: {
        type: DataTypes.ENUM("English", "Telugu"),
        allowNull: false,
      },
    },
    {
      tableName: "live_sessions",
      timestamps: true,
      indexes: [
        {
          fields: ["language"],
        },
      ],
    },
  );
};
