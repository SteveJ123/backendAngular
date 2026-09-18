import { DataTypes, Model } from "sequelize";

class User extends Model {}

export const initUser = (sequelize) => {
  User.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      username: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      mobile: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
      },
      passwordHash: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM("user", "admin"),
        allowNull: false,
        defaultValue: "user",
      },
      courseType: {
        type: DataTypes.ENUM("Face Yoga", "Face Yoga + Raj Yoga"),
        allowNull: false,
      },
      language: {
        type: DataTypes.ENUM("English", "Telugu"),
        allowNull: false,
      },
      points: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      completedPracticeDates: {
        type: DataTypes.JSON, // Stores the array of 'YYYY-MM-DD' strings as JSON
        allowNull: false,
        defaultValue: [],
      },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "register", // Preserves your explicit Mongoose collection name
      timestamps: true,
    },
  );

  return User;
};

export default User;
