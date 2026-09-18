import { DataTypes, Model } from "sequelize";

class Comment extends Model {}

export const initComment = (sequelize) => {
  Comment.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      postId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          model: "posts",
          key: "id",
        },
      },
      userId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      username: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      parentId: {
        type: DataTypes.BIGINT,
        allowNull: true,
        defaultValue: null, // null = top-level comment, ID = reply
        references: {
          model: "comments",
          key: "id",
        },
      },
    },
    {
      sequelize,
      modelName: "Comment",
      tableName: "comments",
      timestamps: true,
      indexes: [
        { fields: ["postId"] },
        { fields: ["parentId"] },
        // Compound index to optimize fetching replies per post rapidly
        {
          name: "idx_postId_parentId",
          fields: ["postId", "parentId"],
        },
      ],
    },
  );
  return Comment;
};
export default Comment;
