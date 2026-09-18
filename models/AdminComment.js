import { DataTypes, Model } from "sequelize";

class AdminComment extends Model {}
export const initAdminComment = (sequelize) => {
  AdminComment.init(
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
          model: "admin_posts",
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
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      parentId: {
        type: DataTypes.BIGINT,
        allowNull: true,
        defaultValue: null, // null = top-level comment, ID = reply
        references: {
          model: "admin_comments",
          key: "id",
        },
      },
    },
    {
      sequelize,
      modelName: "AdminComment",
      tableName: "admin_comments",
      timestamps: true,
      indexes: [
        { fields: ["postId"] },
        { fields: ["parentId"] },
        // Compound index to optimize rapid query lookups for parent comments and nested replies
        {
          name: "idx_admin_comments_postId_parentId_createdAt",
          fields: ["postId", "parentId", { name: "createdAt", order: "ASC" }],
        },
      ],
    },
  );
  return AdminComment;
};
export default AdminComment;
