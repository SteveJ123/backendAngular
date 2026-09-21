// import { DataTypes, Model } from "sequelize";

// class Notification extends Model {}

// export const initNotification = (sequelize) => {
//   Notification.init(
//     {
//       id: {
//         type: DataTypes.BIGINT,
//         primaryKey: true,
//         autoIncrement: true,
//       },
//       recipientId: {
//         type: DataTypes.BIGINT,
//         allowNull: false,
//         references: {
//           model: "users",
//           key: "id",
//         },
//       },
//       senderId: {
//         type: DataTypes.BIGINT,
//         allowNull: false,
//         references: {
//           model: "users",
//           key: "id",
//         },
//       },
//       type: {
//         type: DataTypes.ENUM("post", "comment"),
//         allowNull: false,
//         defaultValue: "post",
//       },
//       postId: {
//         type: DataTypes.BIGINT,
//         allowNull: false,
//         // SQL requires direct FKs per target table; polymorphic association is handled via postModel flag
//       },
//       commentId: {
//         type: DataTypes.BIGINT,
//         allowNull: true,
//         defaultValue: null,
//         references: {
//           model: "comments",
//           key: "id",
//         },
//       },
//       postModel: {
//         type: DataTypes.ENUM("Post", "AdminPost"),
//         allowNull: false,
//         defaultValue: "Post",
//       },
//       postContentSnippet: {
//         type: DataTypes.TEXT,
//         allowNull: false,
//       },
//       isRead: {
//         type: DataTypes.BOOLEAN,
//         allowNull: false,
//         defaultValue: false,
//       },
//     },
//     {
//       sequelize,
//       modelName: "Notification",
//       tableName: "notifications",
//       timestamps: true, // Automatically provides createdAt and updatedAt
//       indexes: [
//         { fields: ["recipientId"] },
//         { fields: ["senderId"] },
//         { fields: ["isRead"] },
//       ],
//     },
//   );

//   return Notification;
// };

// export default Notification;

import { DataTypes, Model } from "sequelize";

class Notification extends Model {}

export const initNotification = (sequelize) => {
  Notification.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      recipientId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          model: "register", // Changed from "users" to match User model's tableName
          key: "id",
        },
      },
      senderId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          model: "register", // Changed from "users" to match User model's tableName
          key: "id",
        },
      },
      type: {
        type: DataTypes.ENUM("post", "comment"),
        allowNull: false,
        defaultValue: "post",
      },
      postId: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      commentId: {
        type: DataTypes.BIGINT,
        allowNull: true,
        defaultValue: null,
        references: {
          model: "comments",
          key: "id",
        },
      },
      postModel: {
        type: DataTypes.ENUM("Post", "AdminPost"),
        allowNull: false,
        defaultValue: "Post",
      },
      postContentSnippet: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      isRead: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "Notification",
      tableName: "notifications",
      timestamps: true,
      indexes: [
        { fields: ["recipientId"] },
        { fields: ["senderId"] },
        { fields: ["isRead"] },
      ],
    },
  );

  return Notification;
};

export default Notification;
