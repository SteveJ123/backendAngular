import { sequelize } from "../config/db.js";
import User, { initUser } from "./User.js";
import Post, { initPost } from "./Post.js";
import Comment, { initComment } from "./Comment.js";
import AdminPost, { initAdminPost } from "./AdminPost.js";
import AdminComment, { initAdminComment } from "./AdminComment.js";
import PersonalDetails, { initPersonalDetails } from "./PersonalDetails.js";
import Notification, { initNotification } from "./Notification.js";
import { initCourse } from "./Course.js";
import { initLecture } from "./Lecture.js";
import { initCourseDetails } from "./CourseDetails.js";
import { initLectureDetails } from "./LectureDetails.js";
import { initEvent } from "./Event.js";
import { initLiveSession } from "./LiveSession.js";
import { initProduct } from "./Product.js";
import { initSupportTeam } from "./SupportTeam.js";
import { initNutrition } from "./Nutrition.js";
import DailyRoutine, { initDailyRoutine } from "./DailyRoutine.js"; // 1. Import DailyRoutine

// Initialize DailyRoutine Model
const DailyRoutineModel = initDailyRoutine(sequelize); // 2. Initialize DailyRoutine

// Initialize Nutrition Model
const Nutrition = initNutrition(sequelize);

// Initialize SupportTeam Model
const SupportTeam = initSupportTeam(sequelize);

// Initialize Model
const Event = initEvent(sequelize);
// Initialize Product Model
const Product = initProduct(sequelize);

// Initialize Model
const LiveSession = initLiveSession(sequelize);

// Initialize Models
const CourseDetails = initCourseDetails(sequelize);
const LectureDetails = initLectureDetails(sequelize);

// Initialize Models
const Course = initCourse(sequelize);
const Lecture = initLecture(sequelize);

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
// COURSE & LECTURE ASSOCIATIONS
// ==========================================
Course.hasMany(Lecture, {
  foreignKey: "courseId",
  as: "lectures",
  onDelete: "CASCADE",
});
Lecture.belongsTo(Course, { foreignKey: "courseId" });

// ==========================================
// COURSE DETAILS <-> LECTURE DETAILS
// ==========================================
CourseDetails.hasMany(LectureDetails, {
  foreignKey: "courseDetailsId",
  as: "lectures",
  onDelete: "CASCADE",
});
LectureDetails.belongsTo(CourseDetails, {
  foreignKey: "courseDetailsId",
});

// ==========================================
// USER & DAILY ROUTINES
// ==========================================
User.hasMany(DailyRoutine, { foreignKey: "userId", onDelete: "CASCADE" }); // 3. Set Associations
DailyRoutine.belongsTo(User, { foreignKey: "userId" });

// ==========================================
// DATABASE SYNC & EXPORTS
// ==========================================
const syncDatabase = async () => {
  try {
    await sequelize.sync();
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
  Course,
  Lecture,
  CourseDetails,
  LectureDetails,
  Event,
  LiveSession,
  Product,
  SupportTeam,
  Nutrition,
  DailyRoutine,
  syncDatabase,
};
