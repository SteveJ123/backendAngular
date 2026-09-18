import { DataTypes, Model } from "sequelize";

class AdminPost extends Model {}

export const initAdminPost = (sequelize) => {
  AdminPost.init(
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
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: "",
      },
      language: {
        type: DataTypes.ENUM("English", "Telugu"),
        allowNull: false,
      },
      tagIds: {
        type: DataTypes.JSON, // Stores array of string tags
        defaultValue: [],
      },
      courseType: {
        type: DataTypes.JSON, // Stores array of strings e.g. ["Face Yoga", "Raj Yoga"]
        defaultValue: [],
      },
      mediaFiles: {
        type: DataTypes.JSON, // Stores array of S3 media objects
        defaultValue: [],
      },
      views: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      likes: {
        type: DataTypes.JSON, // Stores array of liked user IDs
        defaultValue: [],
      },
      likeCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: "AdminPost",
      tableName: "admin_posts",
      timestamps: true,
      indexes: [
        { fields: ["userId"] },
        { fields: ["language"] },
        // Compound index for fast language timeline lookups
        {
          name: "idx_admin_posts_language_createdAt",
          fields: ["language", { name: "createdAt", order: "DESC" }],
        },
      ],
    },
  );
  return AdminPost;
};
export default AdminPost;
