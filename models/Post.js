import { DataTypes, Model } from "sequelize";

class Post extends Model {}
export const initPost = (sequelize) => {
  Post.init(
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
        type: DataTypes.JSON, // Stores array of strings e.g. ["tag1", "tag2"]
        defaultValue: [],
      },
      courseType: {
        type: DataTypes.ENUM("Face Yoga", "Face Yoga + Raj Yoga"),
        allowNull: true,
      },
      mediaFiles: {
        type: DataTypes.JSON, // Stores array of objects
        defaultValue: [],
      },
      views: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      likes: {
        type: DataTypes.JSON, // Stores array of user IDs
        defaultValue: [],
      },
      likeCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: "Post",
      tableName: "posts",
      timestamps: true,
      indexes: [
        { fields: ["userId"] },
        { fields: ["language"] },
        {
          name: "idx_language_createdAt",
          fields: ["language", { name: "createdAt", order: "DESC" }],
        },
      ],
    },
  );
  return Post;
};
export default Post;
