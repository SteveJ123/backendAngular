import { DataTypes } from "sequelize";

export const initSupportTeam = (sequelize) => {
  return sequelize.define(
    "SupportTeam",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: "Name is required" },
        },
      },
      role: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: "Role is required" },
        },
      },
      avatar: {
        type: DataTypes.STRING,
        defaultValue: "https://via.placeholder.com/150",
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: "Phone number is required" },
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isEmail: { msg: "Must be a valid email address" },
          notEmpty: { msg: "Email is required" },
        },
        set(value) {
          if (value) {
            this.setDataValue("email", value.toLowerCase());
          }
        },
      },
      available: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      language: {
        type: DataTypes.ENUM("English", "Telugu"),
        allowNull: false,
      },
    },
    {
      tableName: "support_team",
      timestamps: true,
      indexes: [
        {
          fields: ["language"],
        },
      ],
    },
  );
};
