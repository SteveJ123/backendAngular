import { Model, DataTypes } from "sequelize";

export class DailyRoutine extends Model {}

export const initDailyRoutine = (sequelize) => {
  DailyRoutine.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      language: {
        type: DataTypes.ENUM("english", "telugu"),
        allowNull: false,
        defaultValue: "english",
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      // Array of objects stored in JSON column
      routines: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
      },
    },
    {
      sequelize,
      modelName: "DailyRoutine",
      tableName: "daily_routines",
      timestamps: true,
    },
  );

  return DailyRoutine;
};

export default DailyRoutine;
