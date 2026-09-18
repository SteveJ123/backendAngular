import { DataTypes, Model } from "sequelize";

class PersonalDetails extends Model {}
export const initPersonalDetails = (sequelize) => {
  PersonalDetails.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: { msg: "Name is required" },
        },
      },
      aboutYou: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: "",
      },
      gender: {
        type: DataTypes.ENUM("Male", "Female", "Other", ""),
        allowNull: false,
        defaultValue: "",
      },
      birthday: {
        type: DataTypes.STRING(50), // Stores string date format as in original schema
        allowNull: false,
        defaultValue: "",
      },
      profileImage: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: "",
      },
      language: {
        type: DataTypes.ENUM("English", "Telugu"),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "PersonalDetails",
      tableName: "personal_details",
      timestamps: true,
      indexes: [
        { fields: ["userId"] },
        // Compound Unique Index: Ensures 1 record per user per language
        {
          name: "unique_user_language",
          unique: true,
          fields: ["userId", "language"],
        },
      ],
    },
  );
  return PersonalDetails;
};
export default PersonalDetails;
