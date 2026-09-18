// import { sequelize } from "../config/db.js";
// import User, { initUser } from "./User.js";
// import Post, { initPost } from "./Post.js";
// import Comment, { initComment } from "./Comment.js";
// import AdminPost, { initAdminPost } from "./AdminPost.js";
// import AdminComment, { initAdminComment } from "./AdminComment.js";
// import PersonalDetails, { initPersonalDetails } from "./PersonalDetails.js";
// import Notification, { initNotification } from "./Notification.js";

// // ==========================================
// // USER & REGULAR POSTS / COMMENTS
// // ==========================================
// initUser(sequelize);
// initPost(sequelize);
// initComment(sequelize);
// initAdminPost(sequelize);
// initAdminComment(sequelize);
// initPersonalDetails(sequelize);
// initNotification(sequelize);
// // User <-> Post
// User.hasMany(Post, { foreignKey: "userId", onDelete: "CASCADE" });
// Post.belongsTo(User, { foreignKey: "userId" });

// // User <-> Comment
// User.hasMany(Comment, { foreignKey: "userId", onDelete: "CASCADE" });
// Comment.belongsTo(User, { foreignKey: "userId" });

// // Post <-> Comment
// Post.hasMany(Comment, { foreignKey: "postId", onDelete: "CASCADE" });
// Comment.belongsTo(Post, { foreignKey: "postId" });

// // Comment Self-Referencing (Parent <-> Replies)
// Comment.hasMany(Comment, {
//   as: "replies",
//   foreignKey: "parentId",
//   onDelete: "CASCADE",
// });
// Comment.belongsTo(Comment, { as: "parent", foreignKey: "parentId" });

// // ==========================================
// // USER & ADMIN POSTS / COMMENTS
// // ==========================================

// // User <-> AdminPost
// User.hasMany(AdminPost, { foreignKey: "userId", onDelete: "CASCADE" });
// AdminPost.belongsTo(User, { foreignKey: "userId" });

// // User <-> AdminComment
// User.hasMany(AdminComment, { foreignKey: "userId", onDelete: "CASCADE" });
// AdminComment.belongsTo(User, { foreignKey: "userId" });

// // AdminPost <-> AdminComment
// AdminPost.hasMany(AdminComment, { foreignKey: "postId", onDelete: "CASCADE" });
// AdminComment.belongsTo(AdminPost, { foreignKey: "postId" });

// // AdminComment Self-Referencing (Parent <-> Replies)
// AdminComment.hasMany(AdminComment, {
//   as: "replies",
//   foreignKey: "parentId",
//   onDelete: "CASCADE",
// });
// AdminComment.belongsTo(AdminComment, { as: "parent", foreignKey: "parentId" });

// // ==========================================
// // USER & PERSONAL DETAILS
// // ==========================================

// // User <-> PersonalDetails
// User.hasMany(PersonalDetails, { foreignKey: "userId", onDelete: "CASCADE" });
// PersonalDetails.belongsTo(User, { foreignKey: "userId" });

// // User <-> Notification Associations (Recipient and Sender)
// User.hasMany(Notification, {
//   as: "receivedNotifications",
//   foreignKey: "recipientId",
//   onDelete: "CASCADE",
// });
// Notification.belongsTo(User, { as: "recipient", foreignKey: "recipientId" });

// User.hasMany(Notification, {
//   as: "sentNotifications",
//   foreignKey: "senderId",
//   onDelete: "CASCADE",
// });
// Notification.belongsTo(User, { as: "sender", foreignKey: "senderId" });

// // Comment <-> Notification (Optional link to comment)
// Comment.hasMany(Notification, {
//   foreignKey: "commentId",
//   onDelete: "SET NULL",
// });
// Notification.belongsTo(Comment, { foreignKey: "commentId" });

// // Polymorphic BelongsTo target definitions for Post and AdminPost
// Notification.belongsTo(Post, { foreignKey: "postId", constraints: false });
// Notification.belongsTo(AdminPost, { foreignKey: "postId", constraints: false });

// // Notification <-> AdminComment
// Notification.belongsTo(AdminComment, {
//   foreignKey: "commentId",
//   constraints: false,
// });
// AdminComment.hasMany(Notification, {
//   foreignKey: "commentId",
//   constraints: false,
// });

// // Ensure Post and AdminPost associations are also explicitly defined
// Notification.belongsTo(Post, { foreignKey: "postId", constraints: false });
// Notification.belongsTo(AdminPost, { foreignKey: "postId", constraints: false });
// Notification.belongsTo(Comment, {
//   foreignKey: "commentId",
//   constraints: false,
// });
// Notification.belongsTo(User, { as: "sender", foreignKey: "senderId" });

// // ==========================================
// // DATABASE SYNC & EXPORTS
// // ==========================================

// const syncDatabase = async () => {
//   try {
//     // alter: true updates existing tables to match models without dropping data
//     await sequelize.sync({ alter: true });
//     console.log("Database & tables synchronized successfully.");
//   } catch (error) {
//     console.error("Error synchronizing database:", error);
//   }
// };

// export {
//   sequelize,
//   User,
//   Post,
//   Comment,
//   AdminPost,
//   AdminComment,
//   PersonalDetails,
//   Notification,
//   syncDatabase,
// };

import { sequelize } from "../config/db.js";
import User, { initUser } from "./User.js";
import Post, { initPost } from "./Post.js";
import Comment, { initComment } from "./Comment.js";
import AdminPost, { initAdminPost } from "./AdminPost.js";
import AdminComment, { initAdminComment } from "./AdminComment.js";
import PersonalDetails, { initPersonalDetails } from "./PersonalDetails.js";
import Notification, { initNotification } from "./Notification.js";

// Initialize Models
initUser(sequelize);
initPost(sequelize);
initComment(sequelize);
initAdminPost(sequelize);
initAdminComment(sequelize);
initPersonalDetails(sequelize);
initNotification(sequelize);

// ==========================================
// USER & REGULAR POSTS / COMMENTS
// ==========================================
User.hasMany(Post, { foreignKey: "userId", onDelete: "CASCADE" });
Post.belongsTo(User, { foreignKey: "userId" });

User.hasMany(Comment, { foreignKey: "userId", onDelete: "CASCADE" });
Comment.belongsTo(User, { foreignKey: "userId" });

Post.hasMany(Comment, { foreignKey: "postId", onDelete: "CASCADE" });
Comment.belongsTo(Post, { foreignKey: "postId" });

Comment.hasMany(Comment, {
  as: "replies",
  foreignKey: "parentId",
  onDelete: "CASCADE",
});
Comment.belongsTo(Comment, { as: "parent", foreignKey: "parentId" });

// ==========================================
// USER & ADMIN POSTS / COMMENTS
// ==========================================
User.hasMany(AdminPost, { foreignKey: "userId", onDelete: "CASCADE" });
AdminPost.belongsTo(User, { foreignKey: "userId" });

User.hasMany(AdminComment, { foreignKey: "userId", onDelete: "CASCADE" });
AdminComment.belongsTo(User, { foreignKey: "userId" });

AdminPost.hasMany(AdminComment, { foreignKey: "postId", onDelete: "CASCADE" });
AdminComment.belongsTo(AdminPost, { foreignKey: "postId" });

AdminComment.hasMany(AdminComment, {
  as: "replies",
  foreignKey: "parentId",
  onDelete: "CASCADE",
});
AdminComment.belongsTo(AdminComment, { as: "parent", foreignKey: "parentId" });

// ==========================================
// USER & PERSONAL DETAILS
// ==========================================
User.hasMany(PersonalDetails, { foreignKey: "userId", onDelete: "CASCADE" });
PersonalDetails.belongsTo(User, { foreignKey: "userId" });

// ==========================================
// NOTIFICATIONS (POLYMORPHIC ASSOCIATIONS)
// ==========================================
User.hasMany(Notification, {
  as: "receivedNotifications",
  foreignKey: "recipientId",
  onDelete: "CASCADE",
});
Notification.belongsTo(User, { as: "recipient", foreignKey: "recipientId" });

User.hasMany(Notification, {
  as: "sentNotifications",
  foreignKey: "senderId",
  onDelete: "CASCADE",
});
Notification.belongsTo(User, { as: "sender", foreignKey: "senderId" });

// Comments <-> Notifications
Comment.hasMany(Notification, { foreignKey: "commentId", constraints: false });
Notification.belongsTo(Comment, {
  foreignKey: "commentId",
  constraints: false,
});

AdminComment.hasMany(Notification, {
  foreignKey: "commentId",
  constraints: false,
});
Notification.belongsTo(AdminComment, {
  foreignKey: "commentId",
  constraints: false,
});

// Posts <-> Notifications
Post.hasMany(Notification, { foreignKey: "postId", constraints: false });
Notification.belongsTo(Post, { foreignKey: "postId", constraints: false });

AdminPost.hasMany(Notification, { foreignKey: "postId", constraints: false });
Notification.belongsTo(AdminPost, { foreignKey: "postId", constraints: false });

// ==========================================
// DATABASE SYNC & EXPORTS
// ==========================================
const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log("Database & tables synchronized successfully.");
  } catch (error) {
    console.error("Error synchronizing database:", error);
  }
};

export {
  sequelize,
  User,
  Post,
  Comment,
  AdminPost,
  AdminComment,
  PersonalDetails,
  Notification,
  syncDatabase,
};
