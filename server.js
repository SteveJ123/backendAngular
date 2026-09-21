// import dns from "dns";
// import path from "path";
// // server.js or index.js
// import "dotenv/config"; // MUST BE LINE 1

// import db from "./config/db.js";

// import dotenv from "dotenv";
// import express from "express";
// import cors from "cors";
// import fs from "fs";
// import { fileURLToPath } from "url";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import mongoose from "mongoose";

// import {
//   S3Client,
//   PutObjectCommand,
//   DeleteObjectCommand,
// } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// // __dirname is not available directly in ES modules
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // DNS configuration
// dns.setDefaultResultOrder("ipv4first");

// // Load environment variables FIRST
// dotenv.config({
//   path: path.join(__dirname, ".env"),
// });

// Import database connection
// import db from "./config/db.js";
// import Post from "./models/Post.js";
// import User from "./models/User.js";
// import Comment from "./models/Comment.js";
// import Course from "./models/Course.js";
// import Notification from "./models/Notification.js";
import courseRoutes from "./routes/courseDetails.js"; // Adjust path according to your folder structure
// import LiveSession from "./models/LiveSession.js";
// import Product from "./models/Product.js";
// import PersonalDetails from "./models/PersonalDetails.js";
// import AdminPost from "./models/AdminPost.js";
// import SupportTeam from "./models/SupportTeam.js";
// import AdminComment from "./models/AdminComment.js";

// import {
//   syncDatabase,
//   User,
//   Post,
//   Comment,
//   AdminPost,
//   AdminComment,
//   PersonalDetails,
// } from "./models/index.js";
// import upload from "./middleware/upload.js";

// const { Upload } = require("@aws-sdk/lib-storage");

// 1. Core Node.js Modules
import path from "path";
import dns from "dns";
import fs from "fs";
import { fileURLToPath } from "url";

// 2. Setup __dirname BEFORE loading dotenv
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 3. DNS Configuration
dns.setDefaultResultOrder("ipv4first");

// 4. Load Environment Variables BEFORE any local file imports
import dotenv from "dotenv";
dotenv.config({ path: path.join(__dirname, ".env") });

// 5. External Third-Party Packages
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// 6. Local Database & Model Imports (Loaded AFTER environment variables are populated)
import db, { sequelize } from "./config/db.js";
import { Op } from "sequelize";
import {
  syncDatabase,
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
} from "./models/index.js";

// 7. Express App Initialization
const app = express();
app.use(cors());
app.use(express.json());
import upload from "./middleware/upload.js";
import uploadS3 from "./middleware/uploadS3.js";
import { Upload } from "@aws-sdk/lib-storage";
import multer from "multer";
// Ensure 'uploads' directory exists
// if (!fs.existsSync("./uploads")) {
//   fs.mkdirSync("./uploads");
// }
// const upload = multer();

// const app = express();

// 1. Allowed Origins List
const allowedOrigins = [
  "https://www.younghappyandhealthy.com",
  "https://younghappyandhealthy.com", // Include both with and without 'www'
  "http://localhost:3000", // For local development
  "http://localhost:5173", // Vite local port (if using Vite)
  "http://localhost:4200", // Angular local port
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like Postman, Curl, or mobile apps)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        console.error("CORS blocked origin:", origin);
        // Pass false instead of an Error object to prevent 500 crashes
        return callback(null, false);
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "x-language",
      "X-Language",
      "Accept",
      "*",
    ],
    AllowedOrigins: ["*"],
    ExposeHeaders: [],
    credentials: true,
    optionsSuccessStatus: 200, // Fixes issues with legacy browsers/proxies
  }),
);
// 3. Handle Preflight OPTIONS Requests explicitly
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Connect to MongoDB Atlas
// connectDB();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const bucketName = process.env.AWS_BUCKET_NAME;

/**
 * Generates a presigned PUT URL for client-side direct S3 uploads
 */
export const generateUploadUrl = async (fileType, folder = "media") => {
  const extension = fileType.split("/")[1] || "bin";
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${extension}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileName,
    ContentType: fileType,
  });

  // URL expires in 5 minutes (300 seconds)
  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
  const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

  return { uploadUrl, fileUrl, fileName };
};

// app.post("/api/register", async (req, res) => {
//   // Acquire a dedicated connection from the pool for transaction safety
//   const connection = await sequelize.transaction();

//   try {
//     const { username, mobile, password, courseType, language, role } = req.body;

//     // 1. Check if required fields are provided
//     if (!username || !mobile || !password || !courseType || !language) {
//       connection.release();
//       return res
//         .status(400)
//         .json({ message: "All required fields must be provided." });
//     }

//     // 2. Check if user with mobile already exists
//     const [existingUsers] = await connection.execute(
//       "SELECT id FROM register WHERE mobile = ? LIMIT 1",
//       [mobile],
//     );

//     if (existingUsers.length > 0) {
//       connection.release();
//       return res
//         .status(400)
//         .json({ message: "Mobile number is already registered." });
//     }

//     // 3. Hash the password
//     const salt = await bcrypt.genSalt(10);
//     const passwordHash = await bcrypt.hash(password, salt);

//     // Start database transaction
//     await connection.beginTransaction();

//     // 4. Insert new user into `register` table
//     const [userResult] = await connection.execute(
//       `INSERT INTO register (username, mobile, passwordHash, courseType, language, role)
//        VALUES (?, ?, ?, ?, ?, ?)`,
//       [username, mobile, passwordHash, courseType, language, role || "user"],
//     );

//     const newUserId = userResult.insertId;

//     // 5. Insert personal details linking to `newUserId`
//     await connection.execute(
//       `INSERT INTO personaldetails (userId, name, language)
//        VALUES (?, ?, ?)`,
//       [newUserId, username, language],
//     );

//     // Commit transaction
//     await connection.commit();
//     connection.release();

//     return res.status(201).json({
//       message: "User registered successfully",
//       userId: newUserId,
//     });
//   } catch (error) {
//     // Rollback changes if any query fails
//     await connection.rollback();
//     connection.release();

//     console.error("Registration Error:", error);
//     return res
//       .status(500)
//       .json({ message: "Server error during registration." });
//   }
// });

app.post("/api/register", async (req, res) => {
  // 1. Validate required fields before opening a database transaction
  const { username, mobile, password, courseType, language, role } = req.body;

  if (!username || !mobile || !password || !courseType || !language) {
    return res
      .status(400)
      .json({ message: "All required fields must be provided." });
  }

  // 2. Start a managed Sequelize transaction
  const t = await sequelize.transaction();

  try {
    // 3. Check if user with mobile already exists
    const existingUser = await User.findOne({
      where: { mobile },
      transaction: t,
    });

    if (existingUser) {
      await t.rollback();
      return res
        .status(400)
        .json({ message: "Mobile number is already registered." });
    }

    // 4. Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 5. Insert new user into User model
    const newUser = await User.create(
      {
        username,
        mobile,
        passwordHash,
        courseType,
        language,
        role: role || "user",
      },
      { transaction: t },
    );

    // 6. Insert personal details linked to `newUser.id`
    await PersonalDetails.create(
      {
        userId: newUser.id,
        name: username,
        language,
      },
      { transaction: t },
    );

    // 7. Commit transaction
    await t.commit();

    return res.status(201).json({
      message: "User registered successfully",
      userId: newUser.id,
    });
  } catch (error) {
    // Rollback changes if any query fails
    await t.rollback();

    console.error("Registration Error:", error);
    return res
      .status(500)
      .json({ message: "Server error during registration." });
  }
});

// app.get("/api/registered-users", async (req, res) => {
//   try {
//     const { courseType } = req.query;

//     // Filter query construction
//     let query = {};
//     if (courseType) {
//       query.courseType = courseType;
//     }

//     const users = await User.find(query, {
//       username: 1,
//       mobile: 1,
//       role: 1,
//       courseType: 1,
//       language: 1,
//       createdAt: 1,
//     }).sort({ createdAt: -1 });

//     return res.status(200).json({
//       success: true,
//       data: users,
//     });
//   } catch (error) {
//     console.error("Fetch Users Error:", error);
//     return res
//       .status(500)
//       .json({ message: "Server error while fetching registered users" });
//   }
// });

// app.put("/api/registered-users/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { username, mobile, role, courseType } = req.body;

//     // Validate courseType enum
//     const allowedCourses = ["Face Yoga", "Face Yoga + Raj Yoga"];
//     if (courseType && !allowedCourses.includes(courseType)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid course type provided.",
//       });
//     }

//     // Build update object dynamically
//     const updateFields = {};
//     if (username !== undefined) updateFields.username = username;
//     if (mobile !== undefined) updateFields.mobile = mobile;
//     if (role !== undefined) updateFields.role = role;
//     if (courseType !== undefined) updateFields.courseType = courseType;

//     // Perform update in MongoDB
//     const updatedUser = await User.findByIdAndUpdate(
//       id,
//       { $set: updateFields },
//       {
//         new: true, // Return updated document
//         runValidators: true, // Run Mongoose schema validation
//         projection: {
//           username: 1,
//           mobile: 1,
//           role: 1,
//           courseType: 1,
//           createdAt: 1,
//           updatedAt: 1,
//         },
//       },
//     );

//     if (!updatedUser) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found.",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "User updated successfully.",
//       data: updatedUser,
//     });
//   } catch (error) {
//     console.error("Update User Error:", error);

//     // Handle MongoDB duplicate key error (e.g., duplicate mobile number)
//     if (error.code === 11000) {
//       return res.status(400).json({
//         success: false,
//         message: "Mobile number already in use by another account.",
//       });
//     }

//     return res.status(500).json({
//       success: false,
//       message: "Server error while updating user.",
//     });
//   }
// });

// app.delete("/api/registered-users/:id", async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Remove user from MongoDB collection
//     const deletedUser = await User.findByIdAndDelete(id);

//     if (!deletedUser) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found.",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "User deleted successfully.",
//       data: {
//         id: deletedUser._id,
//         username: deletedUser.username,
//       },
//     });
//   } catch (error) {
//     console.error("Delete User Error:", error);

//     // Handle invalid MongoDB ObjectId format
//     if (error.kind === "ObjectId") {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid User ID format.",
//       });
//     }

//     return res.status(500).json({
//       success: false,
//       message: "Server error while deleting user.",
//     });
//   }
// });

// GET: Fetch registered users with optional courseType filter
app.get("/api/registered-users", async (req, res) => {
  try {
    const { courseType } = req.query;

    const whereClause = {};
    if (courseType) {
      whereClause.courseType = courseType;
    }

    // Replaces User.find(query, projection).sort({ createdAt: -1 })
    const users = await User.findAll({
      where: whereClause,
      attributes: [
        "id",
        "username",
        "mobile",
        "role",
        "courseType",
        "language",
        "createdAt",
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Fetch Users Error:", error);
    return res
      .status(500)
      .json({ message: "Server error while fetching registered users" });
  }
});

// PUT: Update registered user
app.put("/api/registered-users/:id", async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    if (isNaN(userId) || userId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid User ID format.",
      });
    }

    const { username, mobile, role, courseType } = req.body;

    // Validate courseType enum
    const allowedCourses = ["Face Yoga", "Face Yoga + Raj Yoga"];
    if (courseType && !allowedCourses.includes(courseType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course type provided.",
      });
    }

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Build update object dynamically
    const updateFields = {};
    if (username !== undefined) updateFields.username = username;
    if (mobile !== undefined) updateFields.mobile = mobile;
    if (role !== undefined) updateFields.role = role;
    if (courseType !== undefined) updateFields.courseType = courseType;

    // Update user record
    await user.update(updateFields);

    // Format output fields to match the previous Mongoose projection
    const updatedUserResponse = {
      id: user.id,
      username: user.username,
      mobile: user.mobile,
      role: user.role,
      courseType: user.courseType,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return res.status(200).json({
      success: true,
      message: "User updated successfully.",
      data: updatedUserResponse,
    });
  } catch (error) {
    console.error("Update User Error:", error);

    // Handle Sequelize Unique Constraint Error (e.g., duplicate mobile number)
    if (
      error.name === "SequelizeUniqueConstraintError" ||
      error.name === "SequelizeUniqueConstraintError"
    ) {
      return res.status(400).json({
        success: false,
        message: "Mobile number already in use by another account.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error while updating user.",
    });
  }
});

// DELETE: Remove user
app.delete("/api/registered-users/:id", async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    if (isNaN(userId) || userId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid User ID format.",
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const deletedUserData = {
      id: user.id,
      username: user.username,
    };

    // Remove user from SQL table
    await user.destroy();

    return res.status(200).json({
      success: true,
      message: "User deleted successfully.",
      data: deletedUserData,
    });
  } catch (error) {
    console.error("Delete User Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while deleting user.",
    });
  }
});

// app.post("/api/login", async (req, res) => {
//   try {
//     const { mobile, password } = req.body;

//     if (!mobile || !password) {
//       return res
//         .status(400)
//         .json({ message: "Mobile and password are required" });
//     }

//     // 1. Fetch user & matched profile image using a single LEFT JOIN query
//     const [rows] = await db.execute(
//       `SELECT
//         u.id,
//         u.username,
//         u.mobile,
//         u.passwordHash,
//         u.role,
//         u.courseType,
//         u.language,
//         p.profileImage
//        FROM register u
//        LEFT JOIN personaldetails p
//          ON u.id = p.userId AND p.language = u.language
//        WHERE u.mobile = ?
//        LIMIT 1`,
//       [mobile],
//     );

//     if (rows.length === 0) {
//       return res
//         .status(404)
//         .json({ message: "User not registered. Please sign up first." });
//     }

//     const user = rows[0];

//     // 2. Check password
//     const isMatch = await bcrypt.compare(password, user.passwordHash);
//     if (!isMatch) {
//       return res
//         .status(401)
//         .json({ message: "Invalid mobile number or password" });
//     }

//     const profileImage = user.profileImage || "";
//     console.log("profileImage", profileImage);

//     // 3. Generate JWT Token
//     const token = jwt.sign(
//       {
//         userId: user.id,
//         mobile: user.mobile,
//         role: user.role,
//         language: user.language,
//         profileImage,
//       },
//       process.env.JWT_SECRET || "YOUR_JWT_SECRET_KEY",
//       { expiresIn: "1d" },
//     );

//     // 4. Return success response with user details & profileImage
//     return res.status(200).json({
//       success: true,
//       message: "Login successful!",
//       token,
//       id: user.id,
//       role: user.role,
//       username: user.username,
//       courseType: user.courseType,
//       language: user.language,
//       profileImage,
//     });
//   } catch (error) {
//     console.error("Login Error:", error);
//     return res.status(500).json({ message: "Server error during login" });
//   }
// });

app.post("/api/login", async (req, res) => {
  try {
    const { mobile, password } = req.body;

    if (!mobile || !password) {
      return res
        .status(400)
        .json({ message: "Mobile and password are required" });
    }

    // 1. Fetch user & associated PersonalDetails matching language using eager loading
    const user = await User.findOne({
      where: { mobile },
      include: [
        {
          model: PersonalDetails,
          required: false, // Executes a LEFT OUTER JOIN
          attributes: ["profileImage", "language"],
        },
      ],
    });

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not registered. Please sign up first." });
    }

    // 2. Validate password against stored hash
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Invalid mobile number or password" });
    }

    // 3. Extract profile image matching user's language preference
    const matchedProfile =
      user.PersonalDetails?.find(
        (profile) => profile.language === user.language,
      ) || user.PersonalDetails?.[0];

    const profileImage = matchedProfile?.profileImage || "";
    console.log("profileImage", profileImage);

    // 4. Generate JWT Token
    const token = jwt.sign(
      {
        userId: user.id,
        mobile: user.mobile,
        role: user.role,
        language: user.language,
        profileImage,
      },
      process.env.JWT_SECRET || "YOUR_JWT_SECRET_KEY",
      { expiresIn: "1d" },
    );

    // 5. Return success response
    return res.status(200).json({
      success: true,
      message: "Login successful!",
      token,
      id: user.id,
      role: user.role,
      username: user.username,
      courseType: user.courseType,
      language: user.language,
      profileImage,
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Server error during login" });
  }
});

const getMediaTypeFromUrl = (url = "") => {
  const cleanUrl = url.split("?")[0].toLowerCase(); // Strip query params if any
  if (/\.(jpg|jpeg|png|webp|gif|svg)$/.test(cleanUrl)) return "image";
  if (/\.(mp4|webm|ogg|mov|mkv)$/.test(cleanUrl)) return "video";
  if (/\.(mp3|wav|aac|m4a|flac)$/.test(cleanUrl)) return "audio";
  return "file";
};

// sql
// app.post("/api/posts", async (req, res) => {
//   const connection = await db.getConnection();

//   try {
//     const { userId, content, tagIds, fileLink, fileLinks, targetLanguage } =
//       req.body;

//     if (!userId) {
//       return res.status(400).json({
//         success: false,
//         message: "userId is required to create a post.",
//       });
//     }

//     // 1. Fetch author details to enforce language & course type rules
//     const [authors] = await connection.execute(
//       "SELECT id, role, language, courseType FROM register WHERE id = ?",
//       [userId],
//     );

//     if (authors.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "Post author not found in database.",
//       });
//     }

//     const author = authors[0];

//     // Determine target post language
//     const postLanguage =
//       author.role === "admin"
//         ? targetLanguage || author.language
//         : author.language;

//     // Safely parse JSON strings sent from Angular FormData/JSON
//     let parsedTagIds = [];
//     if (tagIds) {
//       try {
//         parsedTagIds = typeof tagIds === "string" ? JSON.parse(tagIds) : tagIds;
//       } catch (e) {
//         parsedTagIds = [];
//       }
//     }

//     // 2. Process incoming S3 file URLs
//     const rawLinks = fileLinks
//       ? Array.isArray(fileLinks)
//         ? fileLinks
//         : [fileLinks]
//       : fileLink
//         ? [fileLink]
//         : [];

//     const mediaFiles = rawLinks
//       .filter((link) => typeof link === "string" && link.trim() !== "")
//       .map((link) => ({
//         fileLink: link.trim(),
//         mediaType: getMediaTypeFromUrl(link),
//       }));

//     // Start transaction for atomic Post & Notifications insertion
//     await connection.beginTransaction();

//     // 3. Create the post
//     const insertPostQuery = `
//       INSERT INTO posts
//         (userId, content, tagIds, courseType, language, mediaFiles)
//       VALUES (?, ?, ?, ?, ?, ?)
//     `;

//     const [postResult] = await connection.execute(insertPostQuery, [
//       userId,
//       content ? content.trim() : "",
//       JSON.stringify(parsedTagIds),
//       author.courseType || null,
//       postLanguage,
//       JSON.stringify(mediaFiles),
//     ]);

//     const newPostId = postResult.insertId;

//     // 4. Build target recipients query matched strictly by POST LANGUAGE
//     const [targetUsers] = await connection.execute(
//       "SELECT id FROM register WHERE id != ? AND (language = ? OR role = 'admin')",
//       [userId, postLanguage],
//     );

//     // 5. Bulk insert notification records
//     if (targetUsers.length > 0) {
//       const snippet = content ? content.trim() : "Uploaded media post.";

//       const notificationValues = targetUsers.map((user) => [
//         user.id, // recipientId
//         author.id, // senderId
//         "post", // type
//         newPostId, // postId
//         "Post", // postModel
//         snippet, // postContentSnippet
//         false, // isRead
//       ]);

//       const insertNotificationsQuery = `
//         INSERT INTO notifications
//           (recipientId, senderId, type, postId, postModel, postContentSnippet, isRead)
//         VALUES ?
//       `;

//       // mysql2 uses query() format for bulk multi-row inserts (VALUES ?)
//       await connection.query(insertNotificationsQuery, [notificationValues]);
//     }

//     // Commit transaction
//     await connection.commit();

//     // Construct return data matching MongoDB output schema
//     const newPost = {
//       _id: newPostId,
//       userId,
//       content: content ? content.trim() : "",
//       tagIds: parsedTagIds,
//       courseType: author.courseType,
//       language: postLanguage,
//       mediaFiles,
//       likeCount: 0,
//       likes: [],
//       views: 0,
//       createdAt: new Date(),
//       updatedAt: new Date(),
//     };

//     return res.status(201).json({
//       success: true,
//       message: "Post created and notifications queued successfully.",
//       data: newPost,
//     });
//   } catch (error) {
//     await connection.rollback();
//     console.error("Error creating post:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server Error",
//       error: error.message,
//     });
//   } finally {
//     connection.release();
//   }
// });

// app.post("/api/posts", async (req, res) => {
//   try {
//     const { userId, content, tagIds, fileLink, fileLinks, targetLanguage } =
//       req.body;

//     if (!userId) {
//       return res.status(400).json({
//         success: false,
//         message: "userId is required to create a post.",
//       });
//     }

//     // 1. Fetch author details to enforce language & course type rules
//     const author = await User.findByPk(userId, {
//       attributes: ["id", "role", "language", "courseType"],
//     });

//     if (!author) {
//       return res.status(404).json({
//         success: false,
//         message: "Post author not found in database.",
//       });
//     }

//     // Determine target post language
//     const postLanguage =
//       author.role === "admin"
//         ? targetLanguage || author.language
//         : author.language;

//     // Safely parse JSON strings sent from Angular FormData/JSON
//     let parsedTagIds = [];
//     if (tagIds) {
//       try {
//         parsedTagIds = typeof tagIds === "string" ? JSON.parse(tagIds) : tagIds;
//       } catch (e) {
//         parsedTagIds = [];
//       }
//     }

//     // 2. Process incoming S3 file URLs
//     const rawLinks = fileLinks
//       ? Array.isArray(fileLinks)
//         ? fileLinks
//         : [fileLinks]
//       : fileLink
//         ? [fileLink]
//         : [];

//     const mediaFiles = rawLinks
//       .filter((link) => typeof link === "string" && link.trim() !== "")
//       .map((link) => ({
//         fileLink: link.trim(),
//         mediaType: getMediaTypeFromUrl(link),
//       }));

//     // Start managed transaction for atomic Post & Notification creation
//     const result = await sequelize.transaction(async (t) => {
//       // 3. Create the post
//       const newPost = await Post.create(
//         {
//           userId: author.id,
//           content: content ? content.trim() : "",
//           tagIds: parsedTagIds,
//           courseType: author.courseType || null,
//           language: postLanguage,
//           mediaFiles,
//         },
//         { transaction: t },
//       );

//       // 4. Fetch target recipients matched strictly by POST LANGUAGE
//       const targetUsers = await User.findAll({
//         where: {
//           id: { [Op.ne]: author.id },
//           [Op.or]: [{ language: postLanguage }, { role: "admin" }],
//         },
//         attributes: ["id"],
//         transaction: t,
//       });

//       // 5. Bulk insert notification records
//       if (targetUsers.length > 0) {
//         const snippet = content ? content.trim() : "Uploaded media post.";

//         const notificationsData = targetUsers.map((user) => ({
//           recipientId: user.id,
//           senderId: author.id,
//           type: "post",
//           postId: newPost.id,
//           postModel: "Post",
//           postContentSnippet: snippet,
//           isRead: false,
//         }));

//         await Notification.bulkCreate(notificationsData, { transaction: t });
//       }

//       return newPost;
//     });

//     // 6. Return response matching legacy schema expectations
//     return res.status(201).json({
//       success: true,
//       message: "Post created and notifications queued successfully.",
//       data: {
//         _id: result.id,
//         id: result.id,
//         userId: result.userId,
//         content: result.content,
//         tagIds: result.tagIds,
//         courseType: result.courseType,
//         language: result.language,
//         mediaFiles: result.mediaFiles,
//         likeCount: result.likeCount || 0,
//         likes: result.likes || [],
//         views: result.views || 0,
//         createdAt: result.createdAt,
//         updatedAt: result.updatedAt,
//       },
//     });
//   } catch (error) {
//     console.error("Error creating post:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server Error",
//       error: error.message,
//     });
//   }
// });

app.post("/api/posts", async (req, res) => {
  try {
    const { userId, content, tagIds, fileLink, fileLinks, targetLanguage } =
      req.body;

    const parsedUserId = parseInt(userId, 10);
    if (!parsedUserId || isNaN(parsedUserId) || parsedUserId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid userId is required to create a post.",
      });
    }

    // 1. Fetch author details to enforce language & course type rules
    const author = await User.findByPk(parsedUserId, {
      attributes: ["id", "role", "language", "courseType"],
    });

    if (!author) {
      return res.status(404).json({
        success: false,
        message: "Post author not found in database.",
      });
    }

    // Determine target post language and normalize casing
    let rawLang =
      author.role === "admin"
        ? targetLanguage || author.language || "English"
        : author.language || "English";

    rawLang = rawLang.trim();
    const postLanguage =
      rawLang.charAt(0).toUpperCase() + rawLang.slice(1).toLowerCase();

    // Safely parse JSON strings sent from FormData / JSON payloads
    let parsedTagIds = [];
    if (tagIds) {
      try {
        parsedTagIds = typeof tagIds === "string" ? JSON.parse(tagIds) : tagIds;
      } catch (e) {
        parsedTagIds = [];
      }
    }

    // 2. Process incoming file URLs
    const rawLinks = fileLinks
      ? Array.isArray(fileLinks)
        ? fileLinks
        : [fileLinks]
      : fileLink
        ? [fileLink]
        : [];

    const mediaFiles = rawLinks
      .filter((link) => typeof link === "string" && link.trim() !== "")
      .map((link) => ({
        fileLink: link.trim(),
        mediaType: getMediaTypeFromUrl(link),
      }));

    // Start managed transaction for atomic Post & Notification creation
    const result = await sequelize.transaction(async (t) => {
      // 3. Create the post
      const newPost = await Post.create(
        {
          userId: author.id,
          content: content ? content.trim() : "",
          tagIds: parsedTagIds,
          courseType: author.courseType || null,
          language: postLanguage,
          mediaFiles,
        },
        { transaction: t },
      );

      // 4. Fetch recipients: Students matching post language OR any Admin user (Excluding Author)
      const targetUsers = await User.findAll({
        where: {
          id: { [Op.ne]: author.id }, // Always exclude author
          [Op.or]: [
            { language: postLanguage },
            { language: postLanguage.toLowerCase() },
            { language: postLanguage.toUpperCase() },
            { role: "admin" }, // Admins receive all notifications across languages
          ],
        },
        attributes: ["id"],
        raw: true,
        transaction: t,
      });

      // 5. Bulk insert notification records
      if (targetUsers.length > 0) {
        const snippet = content ? content.trim() : "Uploaded media post.";

        const notificationsData = targetUsers.map((user) => ({
          recipientId: user.id,
          senderId: author.id,
          type: "post",
          postId: newPost.id,
          postModel: "Post",
          postContentSnippet: snippet,
          isRead: false,
        }));

        await Notification.bulkCreate(notificationsData, { transaction: t });
      }

      return newPost;
    });

    // 6. Return response
    return res.status(201).json({
      success: true,
      message: "Post created and notifications queued successfully.",
      data: {
        _id: result.id,
        id: result.id,
        userId: result.userId,
        content: result.content,
        tagIds: result.tagIds,
        courseType: result.courseType,
        language: result.language,
        mediaFiles: result.mediaFiles,
        likeCount: result.likeCount || 0,
        likes: result.likes || [],
        views: result.views || 0,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error creating post:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
});

// sql
// app.get("/api/posts", async (req, res) => {
//   try {
//     const { language } = req.query;

//     let formattedLang;
//     if (language) {
//       const lower = language.toLowerCase();
//       if (lower === "te" || lower === "telugu") formattedLang = "Telugu";
//       if (lower === "en" || lower === "english") formattedLang = "English";
//     }

//     // 1. Fetch Posts with Author details and PersonalDetails profile
//     let postsQuery = `
//       SELECT
//         p.id,
//         p.content,
//         p.courseType,
//         p.language,
//         p.mediaFiles,
//         p.tagIds,
//         p.likeCount,
//         p.likes,
//         p.views,
//         p.created_at AS createdAt,
//         p.updated_at AS updatedAt,
//         u.id AS author_id,
//         u.username AS author_username,
//         u.mobile AS author_mobile,
//         u.role AS author_role,
//         u.courseType AS author_courseType,
//         u.language AS author_language,
//         COALESCE(pd.name, u.username, 'Unknown User') AS author_name,
//         COALESCE(pd.profileImage, '') AS author_profileImage
//       FROM posts p
//       LEFT JOIN register u
//         ON p.userId = u.id
//       LEFT JOIN personaldetails pd
//         ON u.id = pd.userId
//        AND pd.language = COALESCE(p.language, u.language)
//     `;

//     const queryParams = [];
//     if (formattedLang) {
//       postsQuery += ` WHERE p.language = ? OR u.language = ?`;
//       queryParams.push(formattedLang, formattedLang);
//     }

//     postsQuery += ` ORDER BY p.created_at DESC`;

//     const [postRows] = await db.execute(postsQuery, queryParams);

//     if (postRows.length === 0) {
//       return res.status(200).json({ success: true, data: [] });
//     }

//     // Extract post IDs to batch-fetch comments
//     const postIds = postRows.map((post) => post.id);

//     // 2. Fetch all comments for these posts along with Comment Author profiles
//     const placeholders = postIds.map(() => "?").join(",");
//     const commentsQuery = `
//       SELECT
//         c.id,
//         c.postId,
//         c.content,
//         c.created_at AS createdAt,
//         u.id AS comment_author_id,
//         u.username AS comment_author_username,
//         COALESCE(pd.name, u.username, 'Unknown User') AS comment_author_name,
//         COALESCE(pd.profileImage, '') AS comment_author_profileImage
//       FROM comments c
//       LEFT JOIN register u
//         ON c.userId = u.id
//       LEFT JOIN posts p
//         ON c.postId = p.id
//       LEFT JOIN personaldetails pd
//         ON u.id = pd.userId
//        AND pd.language = COALESCE(p.language, u.language)
//       WHERE c.postId IN (${placeholders})
//       ORDER BY c.created_at ASC
//     `;

//     const [commentRows] = await db.execute(commentsQuery, postIds);

//     // 3. Group comments by postId
//     const commentsByPostId = {};
//     commentRows.forEach((comment) => {
//       if (!commentsByPostId[comment.postId]) {
//         commentsByPostId[comment.postId] = [];
//       }
//       commentsByPostId[comment.postId].push({
//         _id: comment.id,
//         content: comment.content,
//         createdAt: comment.createdAt,
//         userId: {
//           _id: comment.comment_author_id,
//           username: comment.comment_author_username,
//           name: comment.comment_author_name,
//           profileImage: comment.comment_author_profileImage,
//         },
//       });
//     });

//     // 4. Map final response payload to retain MongoDB structure
//     const posts = postRows.map((post) => {
//       const allComments = commentsByPostId[post.id] || [];

//       // Parse JSON columns if stored as JSON strings in MySQL
//       let mediaFiles = post.mediaFiles;
//       let tagIds = post.tagIds;
//       let likes = post.likes;

//       if (typeof mediaFiles === "string")
//         mediaFiles = JSON.parse(mediaFiles || "[]");
//       if (typeof tagIds === "string") tagIds = JSON.parse(tagIds || "[]");
//       if (typeof likes === "string") likes = JSON.parse(likes || "[]");

//       return {
//         _id: post.id,
//         content: post.content,
//         courseType: post.courseType,
//         language: post.language,
//         mediaFiles,
//         tagIds,
//         likeCount: post.likeCount || 0,
//         likes,
//         views: post.views || 0,
//         createdAt: post.createdAt,
//         updatedAt: post.updatedAt,
//         commentCount: allComments.length,
//         allComments,
//         userId: {
//           _id: post.author_id || post.userId,
//           username: post.author_username,
//           name: post.author_name,
//           mobile: post.author_mobile,
//           role: post.author_role,
//           courseType: post.author_courseType,
//           language: post.author_language,
//           profileImage: post.author_profileImage,
//         },
//       };
//     });

//     return res.status(200).json({ success: true, data: posts });
//   } catch (error) {
//     console.error("Error fetching posts:", error);
//     return res.status(500).json({ success: false, message: error.message });
//   }
// });

app.get("/api/posts", async (req, res) => {
  try {
    const { language } = req.query;

    let formattedLang;
    if (language) {
      const lower = language.toLowerCase();
      if (lower === "te" || lower === "telugu") formattedLang = "Telugu";
      if (lower === "en" || lower === "english") formattedLang = "English";
    }

    // 1. Build language filter condition for post or post author
    const whereCondition = {};
    if (formattedLang) {
      whereCondition[Op.or] = [
        { language: formattedLang },
        { "$User.language$": formattedLang },
      ];
    }

    // 2. Fetch Posts with Author, PersonalDetails, and Comments eager-loaded
    const postsData = await Post.findAll({
      where: whereCondition,
      order: [
        ["createdAt", "DESC"],
        [{ model: Comment, as: "Comments" }, "createdAt", "ASC"],
      ],
      include: [
        {
          model: User,
          attributes: [
            "id",
            "username",
            "mobile",
            "role",
            "courseType",
            "language",
          ],
          include: [
            {
              model: PersonalDetails,
              required: false,
              attributes: ["name", "profileImage", "language"],
            },
          ],
        },
        {
          model: Comment,
          required: false,
          include: [
            {
              model: User,
              attributes: ["id", "username"],
              include: [
                {
                  model: PersonalDetails,
                  required: false,
                  attributes: ["name", "profileImage", "language"],
                },
              ],
            },
          ],
        },
      ],
    });

    // 3. Format payload to maintain backward compatibility with MongoDB/legacy schema
    const posts = postsData.map((postInstance) => {
      const post = postInstance.toJSON();

      // Helper to safely parse double-stringified / escaped JSON arrays
      const parseJsonField = (fieldValue) => {
        if (!fieldValue) return [];
        if (Array.isArray(fieldValue)) return fieldValue;
        if (typeof fieldValue === "string") {
          try {
            const cleaned = fieldValue
              .replace(/\\"/g, '"')
              .replace(/^"|"$/g, "");
            const parsed = JSON.parse(cleaned);
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [];
          }
        }
        return [];
      };
      const author = post.User || {};

      // Match author's profile image/name for the post's language
      const authorProfile =
        author.PersonalDetails?.find(
          (pd) => pd.language === (post.language || author.language),
        ) || author.PersonalDetails?.[0];

      const authorName =
        authorProfile?.name || author.username || "Unknown User";
      const authorProfileImage = authorProfile?.profileImage || "";

      // Process comments for this post
      const allComments = (post.Comments || []).map((comment) => {
        const commentUser = comment.User || {};
        const commentProfile =
          commentUser.PersonalDetails?.find(
            (pd) => pd.language === (post.language || author.language),
          ) || commentUser.PersonalDetails?.[0];

        return {
          _id: comment.id,
          content: comment.content,
          createdAt: comment.createdAt,
          userId: {
            _id: commentUser.id,
            username: commentUser.username,
            name:
              commentProfile?.name || commentUser.username || "Unknown User",
            profileImage: commentProfile?.profileImage || "",
          },
        };
      });

      return {
        _id: post.id,
        content: post.content,
        courseType: post.courseType,
        language: post.language,
        mediaFiles: parseJsonField(post.mediaFiles || []),
        tagIds: post.tagIds || [],
        likeCount: post.likeCount || 0,
        likes: post.likes || [],
        views: post.views || 0,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        commentCount: allComments.length,
        allComments,
        userId: {
          _id: author.id,
          username: author.username,
          name: authorName,
          mobile: author.mobile,
          role: author.role,
          courseType: author.courseType,
          language: author.language,
          profileImage: authorProfileImage,
        },
      };
    });

    return res.status(200).json({ success: true, data: posts });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});
// sql
// app.get("/api/posts/user/:userId", async (req, res) => {
//   try {
//     const { userId } = req.params;

//     // Validate if the userId is a valid integer/number
//     const parsedUserId = parseInt(userId, 10);
//     if (isNaN(parsedUserId) || parsedUserId <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid user ID format",
//       });
//     }

//     // Single query joining posts with comments to compute commentCount directly in SQL
//     const query = `
//       SELECT
//         p.id,
//         p.userId,
//         p.content,
//         p.courseType,
//         p.language,
//         p.mediaFiles,
//         p.tagIds,
//         p.likeCount,
//         p.likes,
//         p.views,
//         p.created_at AS createdAt,
//         p.updated_at AS updatedAt,
//         COUNT(c.id) AS commentCount
//       FROM posts p
//       LEFT JOIN comments c ON p.id = c.postId
//       WHERE p.userId = ?
//       GROUP BY p.id
//       ORDER BY p.created_at DESC
//     `;

//     const [rows] = await db.execute(query, [parsedUserId]);

//     // Format final response to match MongoDB structure
//     const posts = rows.map((post) => {
//       let mediaFiles = post.mediaFiles;
//       let tagIds = post.tagIds;
//       let likes = post.likes;

//       // Safely parse JSON strings if stored as JSON/TEXT columns in MySQL
//       if (typeof mediaFiles === "string")
//         mediaFiles = JSON.parse(mediaFiles || "[]");
//       if (typeof tagIds === "string") tagIds = JSON.parse(tagIds || "[]");
//       if (typeof likes === "string") likes = JSON.parse(likes || "[]");

//       return {
//         _id: post.id,
//         userId: post.userId,
//         content: post.content,
//         courseType: post.courseType,
//         language: post.language,
//         mediaFiles,
//         tagIds,
//         likeCount: post.likeCount || 0,
//         likes,
//         views: post.views || 0,
//         commentCount: Number(post.commentCount),
//         createdAt: post.createdAt,
//         updatedAt: post.updatedAt,
//       };
//     });

//     return res.status(200).json({
//       success: true,
//       count: posts.length,
//       data: posts,
//     });
//   } catch (error) {
//     console.error("Error fetching user posts:", error);
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// });

app.get("/api/posts/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate if the userId is a valid integer/number
    const parsedUserId = parseInt(userId, 10);
    if (isNaN(parsedUserId) || parsedUserId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }

    // 1. Fetch posts by userId with aggregated comment count
    const postsData = await Post.findAll({
      where: { userId: parsedUserId },
      attributes: {
        include: [
          [sequelize.fn("COUNT", sequelize.col("Comments.id")), "commentCount"],
        ],
      },
      include: [
        {
          model: Comment,
          attributes: [], // Exclude comment details from output
          required: false,
        },
      ],
      group: ["Post.id"],
      order: [["createdAt", "DESC"]],
    });

    // 2. Format response to maintain legacy/MongoDB output schema
    const posts = postsData.map((postInstance) => {
      const post = postInstance.toJSON();

      return {
        _id: post.id,
        userId: post.userId,
        content: post.content,
        courseType: post.courseType,
        language: post.language,
        mediaFiles: post.mediaFiles || [],
        tagIds: post.tagIds || [],
        likeCount: post.likeCount || 0,
        likes: post.likes || [],
        views: post.views || 0,
        commentCount: Number(post.commentCount || 0),
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      };
    });

    return res.status(200).json({
      success: true,
      count: posts.length,
      data: posts,
    });
  } catch (error) {
    console.error("Error fetching user posts:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
// GET /api/comments/post/:postId

// sql
// app.post("/api/comments", async (req, res) => {
//   try {
//     const { postId, userId, content, parentId, username, language } = req.body;
//     console.log("language", language);

//     if (!postId || !userId || !content?.trim() || !username?.trim()) {
//       return res.status(400).json({
//         success: false,
//         message: "postId, userId, content, and username are required fields.",
//       });
//     }

//     // 1. Fetch parent Post to verify existence & check language context
//     const [posts] = await db.execute(
//       "SELECT id, language FROM posts WHERE id = ?",
//       [postId],
//     );

//     if (posts.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "Post not found.",
//       });
//     }

//     const postLanguage = language || posts[0].language || "English";

//     // 2. Fetch corresponding profile details for this user and language
//     const [profiles] = await db.execute(
//       "SELECT profileImage FROM personaldetails WHERE userId = ? AND language = ? LIMIT 1",
//       [userId, postLanguage],
//     );

//     const profileImage = profiles.length > 0 ? profiles[0].profileImage : "";

//     // 3. Create comment
//     const cleanParentId = parentId ? parentId : null;
//     const [commentResult] = await db.execute(
//       `INSERT INTO comments (postId, userId, username, content, parentId)
//        VALUES (?, ?, ?, ?, ?)`,
//       [postId, userId, username.trim(), content.trim(), cleanParentId],
//     );

//     const commentId = commentResult.insertId;

//     // 4. Fetch target users for notifications (Exclude commenter; include matching language or admin role)
//     const [targetUsers] = await db.execute(
//       `SELECT id FROM register
//        WHERE id != ? AND (language = ? OR LOWER(TRIM(role)) = 'admin')`,
//       [userId, postLanguage],
//     );

//     // Bulk insert notifications if target users exist
//     if (targetUsers.length > 0) {
//       const notificationValues = [];
//       const notificationParams = [];

//       for (const recipient of targetUsers) {
//         notificationValues.push("(?, ?, ?, ?, ?, ?, ?, ?)");
//         notificationParams.push(
//           recipient.id, // recipient
//           userId, // sender
//           postId, // postId
//           commentId, // commentId
//           content.trim(), // postContentSnippet
//           "comment", // type
//           postLanguage, // language
//           0, // isRead (false)
//         );
//       }

//       const bulkInsertNotificationQuery = `
//         INSERT INTO notifications
//           (recipient, sender, postId, commentId, postContentSnippet, type, language, isRead)
//         VALUES ${notificationValues.join(", ")}
//       `;

//       await db.execute(bulkInsertNotificationQuery, notificationParams);
//     }

//     // 5. Return new comment enriched with user details
//     return res.status(201).json({
//       id: commentId,
//       _id: commentId,
//       postId,
//       userId: {
//         _id: String(userId),
//         username: username.trim(),
//         profileImage,
//       },
//       content: content.trim(),
//       parentId: cleanParentId,
//       createdAt: new Date().toISOString(),
//       updatedAt: new Date().toISOString(),
//     });
//   } catch (error) {
//     console.error("Error submitting comment:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Error submitting comment",
//       error: error.message,
//     });
//   }
// });

// app.post("/api/comments", async (req, res) => {
//   try {
//     const { postId, userId, content, parentId, username, language } = req.body;
//     console.log("language", language);

//     if (!postId || !userId || !content?.trim() || !username?.trim()) {
//       return res.status(400).json({
//         success: false,
//         message: "postId, userId, content, and username are required fields.",
//       });
//     }

//     // 1. Fetch parent Post to verify existence & check language context
//     const post = await Post.findByPk(postId, {
//       attributes: ["id", "language"],
//     });

//     if (!post) {
//       return res.status(404).json({
//         success: false,
//         message: "Post not found.",
//       });
//     }

//     const postLanguage = language || post.language || "English";

//     // 2. Fetch corresponding profile details for this user and language
//     const profile = await PersonalDetails.findOne({
//       where: {
//         userId,
//         language: postLanguage,
//       },
//       attributes: ["profileImage"],
//     });

//     const profileImage = profile?.profileImage || "";
//     const cleanParentId = parentId ? parentId : null;

//     // Use managed transaction to atomically create comment & queue notifications
//     const newComment = await sequelize.transaction(async (t) => {
//       // 3. Create comment
//       const comment = await Comment.create(
//         {
//           postId,
//           userId,
//           username: username.trim(),
//           content: content.trim(),
//           parentId: cleanParentId,
//         },
//         { transaction: t },
//       );

//       // 4. Fetch target users for notifications (Exclude commenter; include matching language or admin role)
//       const targetUsers = await User.findAll({
//         where: {
//           id: { [Op.ne]: userId },
//           [Op.or]: [
//             { language: postLanguage },
//             sequelize.where(
//               sequelize.fn(
//                 "LOWER",
//                 sequelize.fn("TRIM", sequelize.col("role")),
//               ),
//               "admin",
//             ),
//           ],
//         },
//         attributes: ["id"],
//         transaction: t,
//       });

//       // Bulk insert notifications if target users exist
//       if (targetUsers.length > 0) {
//         const notificationsData = targetUsers.map((recipient) => ({
//           recipient: recipient.id,
//           sender: userId,
//           postId,
//           commentId: comment.id,
//           postContentSnippet: content.trim(),
//           type: "comment",
//           language: postLanguage,
//           isRead: false,
//         }));

//         await Notification.bulkCreate(notificationsData, { transaction: t });
//       }

//       return comment;
//     });

//     // 5. Return new comment enriched with user details matching legacy schema
//     return res.status(201).json({
//       id: newComment.id,
//       _id: newComment.id,
//       postId: newComment.postId,
//       userId: {
//         _id: String(userId),
//         username: username.trim(),
//         profileImage,
//       },
//       content: newComment.content,
//       parentId: newComment.parentId,
//       createdAt: newComment.createdAt.toISOString(),
//       updatedAt: newComment.updatedAt.toISOString(),
//     });
//   } catch (error) {
//     console.error("Error submitting comment:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Error submitting comment",
//       error: error.message,
//     });
//   }
// });

// app.post("/api/comments", async (req, res) => {
//   try {
//     const { postId, userId, content, parentId, username, language } = req.body;

//     if (!postId || !userId || !content?.trim() || !username?.trim()) {
//       return res.status(400).json({
//         success: false,
//         message: "postId, userId, content, and username are required fields.",
//       });
//     }

//     // 1. Fetch parent Post to verify existence & check language context
//     const post = await Post.findByPk(postId, {
//       attributes: ["id", "language"],
//     });

//     if (!post) {
//       return res.status(404).json({
//         success: false,
//         message: "Post not found.",
//       });
//     }

//     const postLanguage = language || post.language || "English";

//     // 2. Fetch corresponding profile details for this user and language
//     const profile = await PersonalDetails.findOne({
//       where: {
//         userId,
//         language: postLanguage,
//       },
//       attributes: ["profileImage"],
//     });

//     const profileImage = profile?.profileImage || "";
//     const cleanParentId = parentId ? parentId : null;

//     // Use managed transaction to atomically create comment & queue notifications
//     const newComment = await sequelize.transaction(async (t) => {
//       // 3. Create comment
//       const comment = await Comment.create(
//         {
//           postId,
//           userId,
//           username: username.trim(),
//           content: content.trim(),
//           parentId: cleanParentId,
//         },
//         { transaction: t },
//       );

//       // 4. Fetch target users for notifications (Exclude commenter; include matching language or admin role)
//       const targetUsers = await User.findAll({
//         where: {
//           id: { [Op.ne]: userId },
//           [Op.or]: [
//             { language: postLanguage },
//             sequelize.where(
//               sequelize.fn(
//                 "LOWER",
//                 sequelize.fn("TRIM", sequelize.col("role")),
//               ),
//               "admin",
//             ),
//           ],
//         },
//         attributes: ["id"],
//         transaction: t,
//       });

//       // Bulk insert notifications if target users exist
//       if (targetUsers.length > 0) {
//         const notificationsData = targetUsers.map((recipient) => ({
//           recipientId: recipient.id, // Corrected key
//           senderId: userId, // Corrected key
//           postId,
//           commentId: comment.id,
//           postContentSnippet: content.trim(),
//           type: "comment",
//           isRead: false,
//         }));

//         await Notification.bulkCreate(notificationsData, { transaction: t });
//       }

//       return comment;
//     });

//     // 5. Return new comment enriched with user details matching legacy schema
//     return res.status(201).json({
//       id: newComment.id,
//       _id: newComment.id,
//       postId: newComment.postId,
//       userId: {
//         _id: String(userId),
//         username: username.trim(),
//         profileImage,
//       },
//       content: newComment.content,
//       parentId: newComment.parentId,
//       createdAt: newComment.createdAt.toISOString(),
//       updatedAt: newComment.updatedAt.toISOString(),
//     });
//   } catch (error) {
//     console.error("Error submitting comment:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Error submitting comment",
//       error: error.message,
//     });
//   }
// });

// app.get("/api/comments/post/:postId", async (req, res) => {
//   try {
//     const { postId } = req.params;

//     // 1. Fetch parent post to check existence and language context
//     const post = await Post.findByPk(postId, {
//       attributes: ["id", "language"],
//     });

//     if (!post) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Post not found." });
//     }

//     const postLanguage = post.language || "English";

//     // 2. Fetch comments with user details & language-matched profile details
//     const commentsData = await Comment.findAll({
//       where: { postId },
//       order: [["createdAt", "ASC"]],
//       include: [
//         {
//           model: User,
//           attributes: ["id", "username"],
//           include: [
//             {
//               model: PersonalDetails,
//               required: false,
//               where: { language: postLanguage },
//               attributes: ["profileImage"],
//             },
//           ],
//         },
//       ],
//     });

//     // 3. Format row data and organize into parent comments and nested replies
//     const parentComments = [];
//     const repliesMap = {};

//     commentsData.forEach((commentInstance) => {
//       const comment = commentInstance.toJSON();
//       const user = comment.User || {};
//       const profile = user.PersonalDetails?.[0];

//       const formattedComment = {
//         _id: comment.id,
//         postId: comment.postId,
//         content: comment.content,
//         parentId: comment.parentId,
//         createdAt: comment.createdAt,
//         userId: {
//           _id: String(comment.userId),
//           username: user.username || comment.username || "",
//           profileImage: profile?.profileImage || "",
//         },
//       };

//       if (!comment.parentId) {
//         parentComments.push({ ...formattedComment, replies: [] });
//       } else {
//         const pId = String(comment.parentId);
//         if (!repliesMap[pId]) repliesMap[pId] = [];
//         repliesMap[pId].push(formattedComment);
//       }
//     });

//     const structuredComments = parentComments.map((parent) => ({
//       ...parent,
//       replies: repliesMap[String(parent._id)] || [],
//     }));

//     return res.status(200).json({
//       success: true,
//       totalCount: commentsData.length,
//       comments: structuredComments,
//     });
//   } catch (error) {
//     console.error("Error fetching comments:", error);
//     return res
//       .status(500)
//       .json({ message: "Error fetching comments", error: error.message });
//   }
// });

// app.post("/api/comments", async (req, res) => {
//   try {
//     const { postId, userId, content, parentId, username, language } = req.body;

//     if (!postId || !userId || !content?.trim() || !username?.trim()) {
//       return res.status(400).json({
//         success: false,
//         message: "postId, userId, content, and username are required fields.",
//       });
//     }

//     // 1. Fetch parent Post to verify existence & check language context
//     const post = await Post.findByPk(postId, {
//       attributes: ["id", "language", "userId"],
//     });

//     if (!post) {
//       return res.status(404).json({
//         success: false,
//         message: "Post not found.",
//       });
//     }

//     const postLanguage = language || post.language || "English";

//     // 2. Fetch corresponding profile details for commenter
//     const profile = await PersonalDetails.findOne({
//       where: {
//         userId,
//         language: postLanguage,
//       },
//       attributes: ["profileImage"],
//     });

//     const profileImage = profile?.profileImage || "";
//     const cleanParentId = parentId ? parentId : null;

//     // Use managed transaction to atomically create comment & queue notifications
//     const newComment = await sequelize.transaction(async (t) => {
//       // 3. Create comment
//       const comment = await Comment.create(
//         {
//           postId,
//           userId,
//           username: username.trim(),
//           content: content.trim(),
//           parentId: cleanParentId,
//         },
//         { transaction: t },
//       );

//       // 4. Fetch target users for notifications (Exclude commenter; filter by language or admin role)
//       const targetUsers = await User.findAll({
//         where: {
//           id: { [Op.ne]: userId },
//           [Op.or]: [
//             { language: postLanguage },
//             sequelize.where(
//               sequelize.fn(
//                 "LOWER",
//                 sequelize.fn("TRIM", sequelize.col("role")),
//               ),
//               "admin",
//             ),
//           ],
//         },
//         attributes: ["id"],
//         transaction: t,
//       });

//       // 5. Bulk insert notifications into the Notifications table
//       if (targetUsers.length > 0) {
//         const notificationsData = targetUsers.map((recipient) => ({
//           recipientId: recipient.id, // Correct foreign key column for recipient user
//           senderId: userId, // Correct foreign key column for commenter
//           postId: post.id,
//           commentId: comment.id,
//           postModel: "Post",
//           postContentSnippet: content.trim().substring(0, 100), // Snippet of comment content
//           type: "comment",
//           isRead: false,
//         }));

//         await Notification.bulkCreate(notificationsData, { transaction: t });
//       }

//       return comment;
//     });

//     // 6. Return created comment payload
//     return res.status(201).json({
//       id: newComment.id,
//       _id: newComment.id,
//       postId: newComment.postId,
//       userId: {
//         _id: String(userId),
//         username: username.trim(),
//         profileImage,
//       },
//       content: newComment.content,
//       parentId: newComment.parentId,
//       createdAt: newComment.createdAt.toISOString(),
//       updatedAt: newComment.updatedAt.toISOString(),
//     });
//   } catch (error) {
//     console.error("Error submitting comment:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Error submitting comment",
//       error: error.message,
//     });
//   }
// });

// app.post("/api/comments", async (req, res) => {
//   try {
//     const { postId, userId, content, parentId, username, language } = req.body;

//     if (!postId || !userId || !content?.trim() || !username?.trim()) {
//       return res.status(400).json({
//         success: false,
//         message: "postId, userId, content, and username are required fields.",
//       });
//     }

//     // 1. Fetch parent Post to verify existence & check language context
//     const post = await Post.findByPk(postId, {
//       attributes: ["id", "language", "userId"],
//     });

//     if (!post) {
//       return res.status(404).json({
//         success: false,
//         message: "Post not found.",
//       });
//     }

//     // Determine target language context (fallback to post language or "English")
//     const postLanguage = language || post.language || "English";

//     // 2. Fetch corresponding profile details for commenter
//     const profile = await PersonalDetails.findOne({
//       where: {
//         userId,
//         language: postLanguage,
//       },
//       attributes: ["profileImage"],
//     });

//     const profileImage = profile?.profileImage || "";
//     const cleanParentId = parentId || null;

//     // Use managed transaction to atomically create comment & queue notifications
//     const newComment = await sequelize.transaction(async (t) => {
//       // 3. Create comment
//       const comment = await Comment.create(
//         {
//           postId,
//           userId,
//           username: username.trim(),
//           content: content.trim(),
//           parentId: cleanParentId,
//         },
//         { transaction: t }
//       );

//       // 4. Fetch target users for notifications (Exclude commenter; match post language or admin role)
//       const targetUsers = await User.findAll({
//         where: {
//           id: { [Op.ne]: userId },
//           [Op.or]: [
//             { language: postLanguage },
//             sequelize.where(
//               sequelize.fn(
//                 "LOWER",
//                 sequelize.fn("TRIM", sequelize.col("role"))
//               ),
//               "admin"
//             ),
//           ],
//         },
//         attributes: ["id"],
//         transaction: t,
//       });

//       // 5. Bulk insert notifications into the Notifications table
//       if (targetUsers.length > 0) {
//         const notificationsData = targetUsers.map((recipient) => ({
//           recipientId: recipient.id,
//           senderId: userId,
//           postId: post.id,
//           commentId: comment.id,
//           postModel: "Post",
//           postContentSnippet: content.trim(),
//           type: "comment",
//           isRead: false,
//         }));

//         await Notification.bulkCreate(notificationsData, { transaction: t });
//       }

//       return comment;
//     });

//     // 6. Return new comment enriched with user details matching legacy Mongoose contract
//     const commentData = newComment.toJSON();

//     return res.status(201).json({
//       ...commentData,
//       _id: newComment.id,
//       userId: {
//         _id: String(userId),
//         username: username.trim(),
//         profileImage,
//       },
//       createdAt: newComment.createdAt.toISOString(),
//       updatedAt: newComment.updatedAt.toISOString(),
//     });
//   } catch (error) {
//     console.error("Error submitting comment:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Error submitting comment",
//       error: error.message,
//     });
//   }
// });

// app.post("/api/comments", async (req, res) => {
//   try {
//     const { postId, userId, content, parentId, username, language } = req.body;
//     console.log("language", language);

//     if (!postId || !userId || !content?.trim() || !username?.trim()) {
//       return res.status(400).json({
//         success: false,
//         message: "postId, userId, content, and username are required fields.",
//       });
//     }

//     // 1. Fetch parent Post to check language context
//     const post = await Post.findByPk(postId, {
//       attributes: ["id", "language", "userId"],
//     });

//     if (!post) {
//       return res.status(404).json({
//         success: false,
//         message: "Post not found.",
//       });
//     }

//     const postLanguage = language || post.language || "English";

//     // 2. Fetch corresponding profile details for this user and language
//     const profile = await PersonalDetails.findOne({
//       where: {
//         userId,
//         language: postLanguage,
//       },
//       attributes: ["profileImage"],
//     });

//     const profileImage = profile?.profileImage || "";
//     const cleanParentId = parentId || null;

//     // Use managed transaction to atomically create comment & queue notifications
//     const newComment = await sequelize.transaction(async (t) => {
//       // 3. Create comment
//       const comment = await Comment.create(
//         {
//           postId,
//           userId,
//           username: username.trim(),
//           content: content.trim(),
//           parentId: cleanParentId,
//         },
//         { transaction: t },
//       );

//       // 4. Fetch target users for notifications (Exclude commenter; match language or admin role)
//       const targetUsers = await User.findAll({
//         where: {
//           id: { [Op.ne]: userId },
//           [Op.or]: [
//             { language: postLanguage },
//             sequelize.where(
//               sequelize.fn(
//                 "LOWER",
//                 sequelize.fn("TRIM", sequelize.col("role")),
//               ),
//               "admin",
//             ),
//           ],
//         },
//         attributes: ["id"],
//         transaction: t,
//       });

//       // 5. Send targeted notifications with the generated commentId
//       if (targetUsers.length > 0) {
//         const notificationsData = targetUsers.map((recipient) => ({
//           recipientId: recipient.id,
//           senderId: userId,
//           postId: post.id,
//           postModel: "Post",
//           commentId: comment.id, // Successfully binds newly generated Comment ID
//           postContentSnippet: content.trim(),
//           type: "comment",
//           language: postLanguage,
//           isRead: false,
//         }));

//         await Notification.bulkCreate(notificationsData, { transaction: t });
//       }

//       return comment;
//     });

//     // 6. Return new comment enriched with user details
//     const commentData = newComment.toJSON();

//     return res.status(201).json({
//       ...commentData,
//       _id: newComment.id,
//       userId: {
//         _id: String(userId),
//         username: username.trim(),
//         profileImage,
//       },
//       createdAt: newComment.createdAt.toISOString(),
//       updatedAt: newComment.updatedAt.toISOString(),
//     });
//   } catch (error) {
//     console.error("Error submitting comment:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Error submitting comment",
//       error: error.message,
//     });
//   }
// });

app.post("/api/comments", async (req, res) => {
  try {
    const { postId, userId, content, parentId, username, language } = req.body;

    const parsedPostId = parseInt(postId, 10);
    const parsedUserId = parseInt(userId, 10);

    if (
      !parsedPostId ||
      isNaN(parsedPostId) ||
      !parsedUserId ||
      isNaN(parsedUserId) ||
      !content?.trim() ||
      !username?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "postId, userId, content, and username are required fields.",
      });
    }

    // 1. Fetch parent Post to check language context
    const post = await Post.findByPk(parsedPostId, {
      attributes: ["id", "language", "userId"],
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found.",
      });
    }

    // Determine target post language and normalize casing
    let rawLang = language || post.language || "English";
    rawLang = rawLang.trim();
    const postLanguage =
      rawLang.charAt(0).toUpperCase() + rawLang.slice(1).toLowerCase();

    // 2. Fetch corresponding profile details for this user and language
    const profile = await PersonalDetails.findOne({
      where: {
        userId: parsedUserId,
        language: postLanguage,
      },
      attributes: ["profileImage"],
    });

    const profileImage = profile?.profileImage || "";
    const cleanParentId = parentId ? parseInt(parentId, 10) : null;

    // Use managed transaction to atomically create comment & queue notifications
    const newComment = await sequelize.transaction(async (t) => {
      // 3. Create comment record
      const comment = await Comment.create(
        {
          postId: parsedPostId,
          userId: parsedUserId,
          username: username.trim(),
          content: content.trim(),
          parentId: cleanParentId,
        },
        { transaction: t },
      );

      // 4. Fetch target users (Exclude commenter; match language OR admin role)
      const targetUsers = await User.findAll({
        where: {
          id: { [Op.ne]: parsedUserId },
          [Op.or]: [
            { language: postLanguage },
            { language: postLanguage.toLowerCase() },
            { language: postLanguage.toUpperCase() },
            sequelize.where(
              sequelize.fn(
                "LOWER",
                sequelize.fn("TRIM", sequelize.col("role")),
              ),
              "admin",
            ),
          ],
        },
        attributes: ["id"],
        raw: true,
        transaction: t,
      });

      // 5. Send targeted notifications with the generated commentId
      if (targetUsers.length > 0) {
        const notificationsData = targetUsers.map((recipient) => ({
          recipientId: recipient.id,
          senderId: parsedUserId,
          postId: post.id,
          postModel: "Post",
          commentId: comment.id, // Successfully binds newly generated Comment ID
          postContentSnippet: content.trim(),
          type: "comment",
          isRead: false,
        }));

        await Notification.bulkCreate(notificationsData, { transaction: t });
      }

      return comment;
    });

    // 6. Return new comment enriched with user details
    const commentData = newComment.toJSON();

    return res.status(201).json({
      ...commentData,
      _id: commentData.id,
      userId: {
        _id: String(parsedUserId),
        id: parsedUserId,
        username: username.trim(),
        profileImage,
      },
      createdAt: newComment.createdAt.toISOString(),
      updatedAt: newComment.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("Error submitting comment:", error);
    return res.status(500).json({
      success: false,
      message: "Error submitting comment",
      error: error.message,
    });
  }
});
// ----------------------------------------------------
// Increments post views
// ----------------------------------------------------

// sql
// app.get("/api/comments/post/:postId", async (req, res) => {
//   try {
//     const { postId } = req.params;

//     // 1. Fetch parent post to check existence and language context
//     const [posts] = await db.execute(
//       "SELECT id, language FROM posts WHERE id = ?",
//       [postId],
//     );

//     if (!posts || posts.length === 0) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Post not found." });
//     }

//     const postLanguage = posts[0].language || "English";

//     // 2. Fetch comments joined with user details and language-matched profile details
//     const query = `
//       SELECT
//         c.id AS _id,
//         c.postId,
//         c.content,
//         c.parentId,
//         c.created_at AS createdAt,
//         c.userId AS authorId,
//         COALESCE(u.username, c.username) AS username,
//         COALESCE(pd.profileImage, '') AS profileImage
//       FROM comments c
//       LEFT JOIN register u ON c.userId = u.id
//       LEFT JOIN personaldetails pd ON c.userId = pd.userId AND pd.language = ?
//       WHERE c.postId = ?
//       ORDER BY c.created_at ASC
//     `;

//     const [rows] = await db.execute(query, [postLanguage, postId]);

//     // 3. Format row data and organize into parent comments and nested replies
//     const parentComments = [];
//     const repliesMap = {};

//     rows.forEach((row) => {
//       const formattedComment = {
//         _id: row._id,
//         postId: row.postId,
//         content: row.content,
//         parentId: row.parentId,
//         createdAt: row.createdAt,
//         userId: {
//           _id: String(row.authorId),
//           username: row.username || "",
//           profileImage: row.profileImage || "",
//         },
//       };

//       if (!row.parentId) {
//         parentComments.push({ ...formattedComment, replies: [] });
//       } else {
//         const pId = String(row.parentId);
//         if (!repliesMap[pId]) repliesMap[pId] = [];
//         repliesMap[pId].push(formattedComment);
//       }
//     });

//     const structuredComments = parentComments.map((parent) => ({
//       ...parent,
//       replies: repliesMap[String(parent._id)] || [],
//     }));

//     return res.status(200).json({
//       success: true,
//       totalCount: rows.length,
//       comments: structuredComments,
//     });
//   } catch (error) {
//     console.error("Error fetching comments:", error);
//     return res
//       .status(500)
//       .json({ message: "Error fetching comments", error: error.message });
//   }
// });

app.get("/api/comments/post/:postId", async (req, res) => {
  try {
    const { postId } = req.params;

    // 1. Fetch parent post to check existence and language context
    const post = await Post.findByPk(postId, {
      attributes: ["id", "language"],
    });

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found." });
    }

    const postLanguage = post.language || "English";

    // 2. Fetch comments with user details & language-matched profile details
    const commentsData = await Comment.findAll({
      where: { postId },
      order: [["createdAt", "ASC"]],
      include: [
        {
          model: User,
          attributes: ["id", "username"],
          include: [
            {
              model: PersonalDetails,
              required: false,
              where: { language: postLanguage },
              attributes: ["profileImage"],
            },
          ],
        },
      ],
    });

    // 3. Format row data and organize into parent comments and nested replies
    const parentComments = [];
    const repliesMap = {};

    commentsData.forEach((commentInstance) => {
      const comment = commentInstance.toJSON();
      const user = comment.User || {};
      const profile = user.PersonalDetails?.[0];

      const formattedComment = {
        _id: comment.id,
        postId: comment.postId,
        content: comment.content,
        parentId: comment.parentId,
        createdAt: comment.createdAt,
        userId: {
          _id: String(comment.userId),
          username: user.username || comment.username || "",
          profileImage: profile?.profileImage || "",
        },
      };

      if (!comment.parentId) {
        parentComments.push({ ...formattedComment, replies: [] });
      } else {
        const pId = String(comment.parentId);
        if (!repliesMap[pId]) repliesMap[pId] = [];
        repliesMap[pId].push(formattedComment);
      }
    });

    const structuredComments = parentComments.map((parent) => ({
      ...parent,
      replies: repliesMap[String(parent._id)] || [],
    }));

    return res.status(200).json({
      success: true,
      totalCount: commentsData.length,
      comments: structuredComments,
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return res
      .status(500)
      .json({ message: "Error fetching comments", error: error.message });
  }
});

// app.patch("/api/posts/:postId/view", async (req, res) => {
//   try {
//     const { postId } = req.params;

//     // Atomically increment view count by 1
//     const updatedPost = await Post.findByIdAndUpdate(
//       postId,
//       { $inc: { views: 1 } },
//       // { new: true },
//       { returnDocument: "after" },
//     );

//     if (!updatedPost) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Post not found" });
//     }

//     return res.status(200).json({
//       success: true,
//       views: updatedPost.views,
//     });
//   } catch (error) {
//     return res.status(500).json({ success: false, message: error.message });
//   }
// });

// sql
// app.patch("/api/posts/:postId/view", async (req, res) => {
//   try {
//     const { postId } = req.params;

//     // 1. Atomically increment the view count by 1
//     const [updateResult] = await db.execute(
//       "UPDATE posts SET views = COALESCE(views, 0) + 1 WHERE id = ?",
//       [postId],
//     );

//     if (updateResult.affectedRows === 0) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Post not found" });
//     }

//     // 2. Fetch the updated view count
//     const [rows] = await db.execute("SELECT views FROM posts WHERE id = ?", [
//       postId,
//     ]);

//     return res.status(200).json({
//       success: true,
//       views: rows[0].views,
//     });
//   } catch (error) {
//     console.error("Error updating post views:", error);
//     return res.status(500).json({ success: false, message: error.message });
//   }
// });

app.patch("/api/posts/:postId/view", async (req, res) => {
  try {
    const { postId } = req.params;

    // 1. Fetch post instance
    const post = await Post.findByPk(postId);

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    // 2. Atomically increment views count by 1
    const updatedPost = await post.increment("views", { by: 1 });

    return res.status(200).json({
      success: true,
      views: updatedPost.views,
    });
  } catch (error) {
    console.error("Error updating post views:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ----------------------------------------------------
// Toggles likes for a post by a given user
// ----------------------------------------------------

// sql
// app.patch("/api/posts/:postId/like", async (req, res) => {
//   try {
//     const { postId } = req.params;
//     const { userId } = req.body; // Logged-in user's ID

//     if (!userId) {
//       return res
//         .status(400)
//         .json({ success: false, message: "userId is required" });
//     }

//     // 1. Fetch current post likes array and count
//     const [posts] = await db.execute(
//       "SELECT id, COALESCE(likes, '[]') AS likes, COALESCE(likeCount, 0) AS likeCount FROM posts WHERE id = ?",
//       [postId],
//     );

//     if (!posts || posts.length === 0) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Post not found" });
//     }

//     let likesArray = posts[0].likes;
//     if (typeof likesArray === "string") {
//       try {
//         likesArray = JSON.parse(likesArray);
//       } catch {
//         likesArray = [];
//       }
//     }

//     // Convert all elements to strings to make exact comparison safe
//     const targetUserIdStr = String(userId);
//     const hasLiked = likesArray.some((id) => String(id) === targetUserIdStr);

//     let updatedLikes = [];
//     let updatedLikeCount = 0;

//     if (hasLiked) {
//       // Remove user ID and decrement likeCount
//       updatedLikes = likesArray.filter((id) => String(id) !== targetUserIdStr);
//       updatedLikeCount = Math.max(0, Number(posts[0].likeCount) - 1);
//     } else {
//       // Add user ID and increment likeCount
//       updatedLikes = [...likesArray, targetUserIdStr];
//       updatedLikeCount = Number(posts[0].likeCount) + 1;
//     }

//     // 2. Save updated JSON array and count back to the table
//     await db.execute("UPDATE posts SET likes = ?, likeCount = ? WHERE id = ?", [
//       JSON.stringify(updatedLikes),
//       updatedLikeCount,
//       postId,
//     ]);

//     return res.status(200).json({
//       success: true,
//       liked: !hasLiked,
//       likeCount: updatedLikeCount,
//       likes: updatedLikes,
//     });
//   } catch (error) {
//     console.error("Error toggling post like:", error);
//     return res.status(500).json({ success: false, message: error.message });
//   }
// });

app.patch("/api/posts/:postId/like", async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body; // Logged-in user's ID

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "userId is required" });
    }

    // 1. Fetch current post instance
    const post = await Post.findByPk(postId);

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    // Ensure likes array is always an array (Sequelize automatically parses JSON fields)
    let likesArray = Array.isArray(post.likes) ? post.likes : [];

    // Convert all elements to strings to make exact comparison safe
    const targetUserIdStr = String(userId);
    const hasLiked = likesArray.some((id) => String(id) === targetUserIdStr);

    let updatedLikes = [];
    let updatedLikeCount = 0;

    if (hasLiked) {
      // Remove user ID and decrement likeCount
      updatedLikes = likesArray.filter((id) => String(id) !== targetUserIdStr);
      updatedLikeCount = Math.max(0, (post.likeCount || 0) - 1);
    } else {
      // Add user ID and increment likeCount
      updatedLikes = [...likesArray, targetUserIdStr];
      updatedLikeCount = (post.likeCount || 0) + 1;
    }

    // 2. Save updated likes array and count back to database
    await post.update({
      likes: updatedLikes,
      likeCount: updatedLikeCount,
    });

    return res.status(200).json({
      success: true,
      liked: !hasLiked,
      likeCount: updatedLikeCount,
      likes: updatedLikes,
    });
  } catch (error) {
    console.error("Error toggling post like:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET: Filter courses by language & courseType enrollment
// app.get("/api/courses", async (req, res) => {
//   try {
//     const { courseType, role, language } = req.query;
//     const formattedLang = language;

//     const filterQuery = {};

//     if (formattedLang) {
//       filterQuery.language = formattedLang;
//     }

//     // Filter for non-admin students based on their enrolled courseType
//     if (role !== "admin") {
//       if (!courseType) {
//         return res.status(200).json({
//           success: true,
//           count: 0,
//           data: [],
//         });
//       }

//       filterQuery.title = courseType.trim();
//     }

//     const courses = await Course.find(filterQuery).sort({ createdAt: -1 });

//     return res.status(200).json({
//       success: true,
//       count: courses.length,
//       data: courses,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message || "Server error while fetching courses",
//     });
//   }
// });

// // POST: Admin create course
// app.post("/api/courses", async (req, res) => {
//   try {
//     const {
//       title,
//       description,
//       instructor,
//       thumbnail,
//       isPaid,
//       isNewCourse,
//       language,
//     } = req.body;

//     if (!thumbnail || typeof thumbnail !== "string" || !thumbnail.trim()) {
//       return res.status(400).json({
//         success: false,
//         message: "Thumbnail URL is required.",
//       });
//     }

//     if (!title || !title.trim()) {
//       return res.status(400).json({
//         success: false,
//         message: "Course title is required.",
//       });
//     }

//     const formattedLang = language;
//     if (!formattedLang) {
//       return res.status(400).json({
//         success: false,
//         message: "Valid language ('English' or 'Telugu') is required.",
//       });
//     }

//     const newCourse = new Course({
//       title: title.trim(),
//       description,
//       instructor: instructor || "Pooja Agarwala",
//       thumbnail: thumbnail.trim(),
//       isPaid: isPaid === "true" || isPaid === true,
//       isNewCourse: isNewCourse === "true" || isNewCourse === true,
//       language: formattedLang,
//       progress: 0,
//       status: "not_started",
//     });

//     const savedCourse = await newCourse.save();

//     return res.status(201).json({
//       success: true,
//       message: "Course created successfully",
//       data: savedCourse,
//     });
//   } catch (error) {
//     console.error("Error creating course:", error);
//     return res.status(500).json({
//       success: false,
//       message: error.message || "Server error while creating course",
//     });
//   }
// });

// // PUT: Admin update course
// app.put("/api/courses/:id", async (req, res) => {
//   try {
//     const course = await Course.findById(req.params.id);

//     if (!course) {
//       return res.status(404).json({
//         success: false,
//         message: "Course not found",
//       });
//     }

//     // Update string and numeric fields if provided
//     if (req.body.title !== undefined) course.title = req.body.title.trim();
//     if (req.body.description !== undefined)
//       course.description = req.body.description;
//     if (req.body.instructor !== undefined)
//       course.instructor = req.body.instructor;
//     if (req.body.status !== undefined) course.status = req.body.status;
//     if (req.body.progress !== undefined)
//       course.progress = Number(req.body.progress);
//     if (req.body.language !== undefined) course.language = req.body.language;

//     // Handle boolean flags
//     if (req.body.isPaid !== undefined) {
//       course.isPaid = req.body.isPaid === "true" || req.body.isPaid === true;
//     }
//     if (req.body.isNewCourse !== undefined) {
//       course.isNewCourse =
//         req.body.isNewCourse === "true" || req.body.isNewCourse === true;
//     }

//     // Clean up old S3 file if a new thumbnail URL is provided and differs from existing
//     if (req.body.thumbnail && req.body.thumbnail !== course.thumbnail) {
//       if (course.thumbnail) {
//         const oldS3Key = getS3KeyFromUrl(course.thumbnail);
//         if (oldS3Key) {
//           try {
//             await s3.send(
//               new DeleteObjectCommand({
//                 Bucket: process.env.AWS_BUCKET_NAME || bucketName,
//                 Key: oldS3Key,
//               }),
//             );
//             console.log(`Deleted old thumbnail S3 key: ${oldS3Key}`);
//           } catch (s3Err) {
//             console.error(`Failed to delete old S3 key (${oldS3Key}):`, s3Err);
//           }
//         }
//       }
//       course.thumbnail = req.body.thumbnail.trim();
//     }

//     const updatedCourse = await course.save();

//     return res.status(200).json({
//       success: true,
//       message: "Course updated successfully",
//       data: updatedCourse,
//     });
//   } catch (error) {
//     console.error("Error updating course:", error);
//     return res.status(500).json({
//       success: false,
//       message: error.message || "Server error while updating course",
//     });
//   }
// });

// // DELETE: Admin remove a course and its thumbnail image
// app.delete("/api/courses/:id", async (req, res) => {
//   try {
//     const course = await Course.findById(req.params.id);

//     if (!course) {
//       return res.status(404).json({
//         success: false,
//         message: "Course not found.",
//       });
//     }

//     // 1. Delete thumbnail file from disk storage if present
//     if (course.thumbnail) {
//       const fileName = course.thumbnail.split("/uploads/").pop();
//       if (fileName) {
//         const filePath = path.join(process.cwd(), "uploads", fileName);
//         if (fs.existsSync(filePath)) {
//           fs.unlinkSync(filePath);
//         }
//       }
//     }

//     // 2. Remove document from MongoDB
//     await Course.findByIdAndDelete(req.params.id);

//     return res.status(200).json({
//       success: true,
//       message: "Course and thumbnail deleted successfully.",
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message || "Server error while deleting course.",
//     });
//   }
// });

// app.get("/api/notifications", async (req, res) => {
//   try {
//     const { userId, language } = req.query;

//     const parsedUserId = parseInt(userId, 10);
//     if (!userId || isNaN(parsedUserId) || parsedUserId <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: "userId query parameter is required and must be a valid ID.",
//       });
//     }

//     // 1. Fetch user to check role
//     const [userRows] = await db.execute(
//       `SELECT id, role FROM register WHERE id = ?`,
//       [parsedUserId],
//     );

//     if (userRows.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found.",
//       });
//     }

//     const user = userRows[0];

//     // Format target language if provided
//     let targetLang = null;
//     if (language) {
//       const lower = language.toLowerCase();
//       if (lower === "telugu" || lower === "te") targetLang = "Telugu";
//       if (lower === "english" || lower === "en") targetLang = "English";
//     }

//     // 2. Fetch notifications with Sender (register) and Post (adminposts) details
//     // REMOVED n.updated_at FROM SELECT
//     let query = `
//       SELECT
//         n.id AS _id,
//         n.recipientId AS recipient,
//         n.senderId,
//         n.postId,
//         n.type,
//         n.isRead,
//         n.created_at AS createdAt,
//         -- Sender details
//         sr.id AS sender_id,
//         sr.username AS sender_username,
//         sr.courseType AS sender_courseType,
//         sr.role AS sender_role,
//         -- Post details
//         ap.id AS post_id,
//         ap.content AS post_content,
//         ap.mediaFiles AS post_mediaFiles,
//         ap.courseType AS post_courseType,
//         ap.language AS post_language
//       FROM notifications n
//       LEFT JOIN register sr ON n.senderId = sr.id
//       LEFT JOIN adminposts ap ON n.postId = ap.id
//       WHERE n.recipientId = ?
//     `;

//     const queryParams = [parsedUserId];

//     // 3. Filter by language directly in SQL if user is NOT an admin
//     if (user.role !== "admin" && targetLang) {
//       query += ` AND (n.postId IS NULL OR ap.language = ?)`;
//       queryParams.push(targetLang);
//     }

//     query += ` ORDER BY n.created_at DESC`;

//     const [rows] = await db.execute(query, queryParams);

//     // 4. Format objects to match populated Mongoose output structure
//     const notifications = rows.map((n) => {
//       let mediaFiles = n.post_mediaFiles;
//       let postCourseType = n.post_courseType;

//       if (typeof mediaFiles === "string")
//         mediaFiles = JSON.parse(mediaFiles || "[]");
//       if (typeof postCourseType === "string")
//         postCourseType = JSON.parse(postCourseType || "[]");

//       return {
//         _id: n._id,
//         recipient: n.recipient,
//         type: n.type,
//         isRead: Boolean(n.isRead),
//         sender: n.senderId
//           ? {
//               _id: n.sender_id,
//               username: n.sender_username || "",
//               courseType: n.sender_courseType || "",
//               role: n.sender_role || "",
//             }
//           : null,
//         postId: n.postId
//           ? {
//               _id: n.post_id,
//               content: n.post_content || "",
//               mediaFiles: mediaFiles || [],
//               courseType: postCourseType || [],
//               language: n.post_language || "",
//             }
//           : null,
//         createdAt: n.createdAt,
//         updatedAt: n.createdAt, // Fallback to createdAt if updated_at is absent
//       };
//     });

//     return res.status(200).json({
//       success: true,
//       count: notifications.length,
//       data: notifications,
//     });
//   } catch (error) {
//     console.error("Error fetching notifications:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server Error",
//       error: error.message,
//     });
//   }
// });

// app.get("/api/notifications", async (req, res) => {
//   try {
//     const { userId, language } = req.query;

//     const parsedUserId = parseInt(userId, 10);
//     if (!userId || isNaN(parsedUserId) || parsedUserId <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: "userId query parameter is required and must be a valid ID.",
//       });
//     }

//     // 1. Fetch user to verify existence and check role
//     const user = await User.findByPk(parsedUserId, {
//       attributes: ["id", "role"],
//     });

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found.",
//       });
//     }

//     // Format target language if provided
//     let targetLang = null;
//     if (language) {
//       const lower = language.toLowerCase();
//       if (lower === "telugu" || lower === "te") targetLang = "Telugu";
//       if (lower === "english" || lower === "en") targetLang = "English";
//     }

//     // 2. Build where filter for Notifications
//     const whereClause = {
//       recipientId: parsedUserId,
//     };

//     // Filter by post language directly if user is NOT an admin
//     if (user.role !== "admin" && targetLang) {
//       whereClause[Op.or] = [
//         { postId: null },
//         { "$Post.language$": targetLang },
//       ];
//     }

//     // 3. Fetch notifications with Sender and Post details eager-loaded
//     const notificationsData = await Notification.findAll({
//       where: whereClause,
//       order: [["createdAt", "DESC"]],
//       include: [
//         {
//           model: User,
//           as: "Sender", // Adjust alias based on your association definition
//           attributes: ["id", "username", "courseType", "role"],
//           required: false,
//         },
//         {
//           model: Post,
//           attributes: ["id", "content", "mediaFiles", "courseType", "language"],
//           required: false,
//         },
//       ],
//     });

//     // 4. Format objects to match populated output structure
//     const notifications = notificationsData.map((instance) => {
//       const n = instance.toJSON();
//       const sender = n.Sender || n.User; // Supports 'Sender' alias or default 'User'
//       const post = n.Post;

//       return {
//         _id: n.id,
//         recipient: n.recipientId,
//         type: n.type,
//         isRead: Boolean(n.isRead),
//         sender: sender
//           ? {
//               _id: sender.id,
//               username: sender.username || "",
//               courseType: sender.courseType || "",
//               role: sender.role || "",
//             }
//           : null,
//         postId: post
//           ? {
//               _id: post.id,
//               content: post.content || "",
//               mediaFiles: post.mediaFiles || [],
//               courseType: post.courseType || [],
//               language: post.language || "",
//             }
//           : null,
//         createdAt: n.createdAt,
//         updatedAt: n.updatedAt || n.createdAt,
//       };
//     });

//     return res.status(200).json({
//       success: true,
//       count: notifications.length,
//       data: notifications,
//     });
//   } catch (error) {
//     console.error("Error fetching notifications:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server Error",
//       error: error.message,
//     });
//   }
// });

// app.get("/api/notifications", async (req, res) => {
//   try {
//     const { userId, language } = req.query;

//     const parsedUserId = parseInt(userId, 10);
//     if (!userId || isNaN(parsedUserId) || parsedUserId <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: "userId query parameter is required and must be a valid ID.",
//       });
//     }

//     // 1. Fetch user to verify existence and check role
//     const user = await User.findByPk(parsedUserId, {
//       attributes: ["id", "role"],
//     });

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found.",
//       });
//     }

//     // Format target language if provided
//     let targetLang = null;
//     if (language) {
//       const lower = language.toLowerCase();
//       if (lower === "telugu" || lower === "te") targetLang = "Telugu";
//       if (lower === "english" || lower === "en") targetLang = "English";
//     }

//     // 2. Build where filter for Notifications
//     const whereClause = {
//       recipientId: parsedUserId,
//     };

//     // Filter by post language directly if user is NOT an admin
//     if (user.role !== "admin" && targetLang) {
//       whereClause[Op.or] = [
//         { postId: null },
//         { "$Post.language$": targetLang },
//       ];
//     }

//     // 3. Fetch notifications with Sender and Post details eager-loaded
//     const notificationsData = await Notification.findAll({
//       where: whereClause,
//       subQuery: false, // <-- CRITICAL FIX: Prevents SQL errors when querying associated model fields
//       order: [["createdAt", "DESC"]],
//       include: [
//         {
//           model: User,
//           as: "sender", // Adjust alias based on your association definition
//           attributes: ["id", "username", "courseType", "role"],
//           required: false,
//         },
//         {
//           model: Post,
//           attributes: ["id", "content", "mediaFiles", "courseType", "language"],
//           required: false,
//         },
//       ],
//     });

//     // 4. Format objects to match populated output structure
//     const notifications = notificationsData.map((instance) => {
//       const n = instance.toJSON();
//       const sender = n.sender || n.User;
//       const post = n.Post;

//       return {
//         _id: n.id,
//         recipient: n.recipientId,
//         type: n.type,
//         isRead: Boolean(n.isRead),
//         sender: sender
//           ? {
//               _id: sender.id,
//               username: sender.username || "",
//               courseType: sender.courseType || "",
//               role: sender.role || "",
//             }
//           : null,
//         postId: post
//           ? {
//               _id: post.id,
//               content: post.content || "",
//               mediaFiles: post.mediaFiles || [],
//               courseType: post.courseType || [],
//               language: post.language || "",
//             }
//           : null,
//         createdAt: n.createdAt,
//         updatedAt: n.updatedAt || n.createdAt,
//       };
//     });

//     return res.status(200).json({
//       success: true,
//       count: notifications.length,
//       data: notifications,
//     });
//   } catch (error) {
//     console.error("Error fetching notifications:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server Error",
//       error: error.message,
//     });
//   }
// });

// app.get("/api/notifications", async (req, res) => {
//   try {
//     const { userId, language } = req.query;

//     const parsedUserId = parseInt(userId, 10);
//     if (!userId || isNaN(parsedUserId) || parsedUserId <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: "userId query parameter is required and must be a valid ID.",
//       });
//     }

//     // 1. Fetch user to verify existence and check role
//     const user = await User.findByPk(parsedUserId, {
//       attributes: ["id", "role", "language"],
//     });

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found.",
//       });
//     }

//     // Format target language if provided (fallback to user's registered language)
//     let targetLang = null;
//     const langInput = language || user.language;

//     if (langInput) {
//       const lower = langInput.toLowerCase();
//       if (lower === "telugu" || lower === "te") targetLang = "Telugu";
//       if (lower === "english" || lower === "en") targetLang = "English";
//     }

//     // 2. Build where clause
//     const whereClause = {
//       recipientId: parsedUserId,
//     };

//     // Filter directly on the Notification table's language column
//     if (user.role !== "admin" && targetLang) {
//       whereClause[Op.or] = [
//         { language: targetLang },
//         { language: null }, // Fallback for legacy notifications
//       ];
//     }

//     // 3. Fetch notifications with Sender, Post, and AdminPost eager-loaded
//     const notificationsData = await Notification.findAll({
//       where: whereClause,
//       subQuery: false,
//       order: [["createdAt", "DESC"]],
//       include: [
//         {
//           model: User,
//           as: "sender",
//           attributes: ["id", "username", "courseType", "role"],
//           required: false,
//         },
//         {
//           model: Post,
//           as: "post", // Adjust alias based on your association definition
//           attributes: ["id", "content", "mediaFiles", "courseType", "language"],
//           required: false,
//         },
//         {
//           model: AdminPost,
//           as: "adminPost", // Adjust alias based on your AdminPost association
//           attributes: ["id", "content", "mediaFiles", "courseType", "language"],
//           required: false,
//         },
//       ],
//     });

//     // 4. Format objects and handle both Post and AdminPost models
//     const notifications = notificationsData.map((instance) => {
//       const n = instance.toJSON();
//       const sender = n.sender || n.User;

//       // Resolve associated post (either standard Post or AdminPost)
//       const post = n.AdminPost || n.adminPost || n.Post || n.post;

//       return {
//         _id: n.id,
//         recipient: n.recipientId,
//         type: n.type,
//         isRead: Boolean(n.isRead),
//         postModel:
//           n.postModel || (n.AdminPost || n.adminPost ? "AdminPost" : "Post"),
//         language: n.language || (post ? post.language : targetLang),
//         postContentSnippet: n.postContentSnippet || "",
//         sender: sender
//           ? {
//               _id: sender.id,
//               username: sender.username || "",
//               courseType: sender.courseType || "",
//               role: sender.role || "",
//             }
//           : null,
//         postId: post
//           ? {
//               _id: post.id,
//               content: post.content || "",
//               mediaFiles: post.mediaFiles || [],
//               courseType: post.courseType || [],
//               language: post.language || "",
//             }
//           : null,
//         createdAt: n.createdAt,
//         updatedAt: n.updatedAt || n.createdAt,
//       };
//     });

//     return res.status(200).json({
//       success: true,
//       count: notifications.length,
//       data: notifications,
//     });
//   } catch (error) {
//     console.error("Error fetching notifications:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server Error",
//       error: error.message,
//     });
//   }
// });

// app.get("/api/notifications", async (req, res) => {
//   try {
//     const { userId, language } = req.query;

//     const parsedUserId = parseInt(userId, 10);
//     if (!userId || isNaN(parsedUserId) || parsedUserId <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: "userId query parameter is required and must be a valid ID.",
//       });
//     }

//     // 1. Fetch user profile to verify existence and check role/default language
//     const user = await User.findByPk(parsedUserId, {
//       attributes: ["id", "role", "language"],
//     });

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found.",
//       });
//     }

//     // Format target language filter (fallback to registered profile language)
//     let targetLang = null;
//     const langInput = language || user.language;

//     if (langInput) {
//       const lower = langInput.toLowerCase();
//       if (lower === "telugu" || lower === "te") targetLang = "Telugu";
//       if (lower === "english" || lower === "en") targetLang = "English";
//     }

//     // 2. Build Notification table where clause directly
//     const whereClause = {
//       recipientId: parsedUserId,
//     };

//     if (user.role !== "admin" && targetLang) {
//       whereClause[Op.or] = [
//         { language: targetLang },
//         { language: targetLang.toLowerCase() },
//         { language: null }, // Support legacy notification records
//       ];
//     }

//     // 3. Fetch notifications eagerly including associated Post and AdminPost models
//     const notificationsData = await Notification.findAll({
//       where: whereClause,
//       subQuery: false,
//       order: [["createdAt", "DESC"]],
//       include: [
//         {
//           model: User,
//           as: "sender", // Matching association alias
//           attributes: ["id", "username", "courseType", "role"],
//           required: false,
//         },
//         {
//           model: Post,
//           // Removed alias mismatch - uses direct model inclusion
//           attributes: ["id", "content", "mediaFiles", "courseType", "language"],
//           required: false,
//         },
//         {
//           model: AdminPost,
//           attributes: ["id", "content", "mediaFiles", "courseType", "language"],
//           required: false,
//         },
//       ],
//     });

//     // 4. Map output to API structure
//     const notifications = notificationsData.map((instance) => {
//       const n = instance.toJSON();
//       const sender = n.sender || n.User;

//       // Handle polymorphic posts (AdminPost or standard Post)
//       const post = n.AdminPost || n.adminPost || n.Post || n.post;

//       return {
//         _id: n.id,
//         recipient: n.recipientId,
//         type: n.type,
//         isRead: Boolean(n.isRead),
//         postModel: n.postModel || (n.AdminPost ? "AdminPost" : "Post"),
//         language: n.language || (post ? post.language : targetLang),
//         postContentSnippet: n.postContentSnippet || "",
//         sender: sender
//           ? {
//               _id: sender.id,
//               username: sender.username || "",
//               courseType: sender.courseType || "",
//               role: sender.role || "",
//             }
//           : null,
//         postId: post
//           ? {
//               _id: post.id,
//               content: post.content || "",
//               mediaFiles: post.mediaFiles || [],
//               courseType: post.courseType || [],
//               language: post.language || "",
//             }
//           : null,
//         createdAt: n.createdAt,
//         updatedAt: n.updatedAt || n.createdAt,
//       };
//     });

//     return res.status(200).json({
//       success: true,
//       count: notifications.length,
//       data: notifications,
//     });
//   } catch (error) {
//     console.error("Error fetching notifications:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server Error",
//       error: error.message,
//     });
//   }
// });

// app.get("/api/notifications", async (req, res) => {
//   try {
//     const { userId, language } = req.query;

//     const parsedUserId = parseInt(userId, 10);
//     if (!userId || isNaN(parsedUserId) || parsedUserId <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: "userId query parameter is required and must be a valid ID.",
//       });
//     }

//     // 1. Check user profile existence
//     const user = await User.findByPk(parsedUserId, {
//       attributes: ["id", "role", "language"],
//     });

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found.",
//       });
//     }

//     let targetLang = null;
//     const langInput = language || user.language;

//     if (langInput) {
//       const lower = langInput.toLowerCase();
//       if (lower === "telugu" || lower === "te") targetLang = "Telugu";
//       if (lower === "english" || lower === "en") targetLang = "English";
//     }

//     // 2. Fetch notifications matching recipientId
//     const notificationsData = await Notification.findAll({
//       where: {
//         recipientId: parsedUserId,
//       },
//       order: [["createdAt", "DESC"]],
//       include: [
//         {
//           model: User,
//           as: "sender",
//           attributes: ["id", "username", "courseType", "role"],
//           required: false,
//         },
//         {
//           model: Post,
//           attributes: ["id", "content", "mediaFiles", "courseType", "language"],
//           required: false,
//         },
//         {
//           model: AdminPost,
//           attributes: ["id", "content", "mediaFiles", "courseType", "language"],
//           required: false,
//         },
//       ],
//     });

//     // 3. Map output payload and resolve post language dynamically
//     const notifications = notificationsData.map((instance) => {
//       const n = instance.toJSON();
//       const sender = n.sender || n.User;
//       const post = n.AdminPost || n.adminPost || n.Post || n.post;

//       return {
//         _id: n.id,
//         recipient: n.recipientId,
//         type: n.type,
//         isRead: Boolean(n.isRead),
//         postModel: n.postModel || (n.AdminPost ? "AdminPost" : "Post"),
//         language:
//           post && post.language ? post.language : targetLang || "English",
//         postContentSnippet: n.postContentSnippet || "",
//         sender: sender
//           ? {
//               _id: sender.id,
//               username: sender.username || "",
//               courseType: sender.courseType || "",
//               role: sender.role || "",
//             }
//           : null,
//         postId: post
//           ? {
//               _id: post.id,
//               content: post.content || "",
//               mediaFiles: post.mediaFiles || [],
//               courseType: post.courseType || [],
//               language: post.language || "",
//             }
//           : null,
//         createdAt: n.createdAt,
//         updatedAt: n.updatedAt || n.createdAt,
//       };
//     });

//     return res.status(200).json({
//       success: true,
//       count: notifications.length,
//       data: notifications,
//     });
//   } catch (error) {
//     console.error("Error fetching notifications:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server Error",
//       error: error.message,
//     });
//   }
// });

// app.get("/api/notifications", async (req, res) => {
//   try {
//     const { userId, language } = req.query;

//     const parsedUserId = parseInt(userId, 10);
//     if (!userId || isNaN(parsedUserId) || parsedUserId <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: "userId query parameter is required and must be a valid ID.",
//       });
//     }

//     // 1. Check user profile existence
//     const user = await User.findByPk(parsedUserId, {
//       attributes: ["id", "role", "language"],
//     });

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found.",
//       });
//     }

//     let targetLang = null;
//     const langInput = language || user.language;

//     if (langInput) {
//       const lower = langInput.toLowerCase();
//       if (lower === "telugu" || lower === "te") targetLang = "Telugu";
//       if (lower === "english" || lower === "en") targetLang = "English";
//     }

//     // 2. Fetch notifications matching recipientId including Comment model relation
//     const notificationsData = await Notification.findAll({
//       where: {
//         recipientId: parsedUserId,
//       },
//       order: [["createdAt", "DESC"]],
//       include: [
//         {
//           model: User,
//           as: "sender",
//           attributes: ["id", "username", "courseType", "role"],
//           required: false,
//         },
//         {
//           model: Post,
//           attributes: ["id", "content", "mediaFiles", "courseType", "language"],
//           required: false,
//         },
//         {
//           model: AdminPost,
//           attributes: ["id", "content", "mediaFiles", "courseType", "language"],
//           required: false,
//         },
//         {
//           model: Comment,
//           attributes: ["id", "content", "userId", "parentId"],
//           required: false,
//         },
//       ],
//     });

//     // 3. Map output payload and include commentId / comment data
//     const notifications = notificationsData.map((instance) => {
//       const n = instance.toJSON();
//       const sender = n.sender || n.User;
//       const post = n.AdminPost || n.adminPost || n.Post || n.post;
//       const comment = n.Comment || n.comment;

//       // Extract raw comment ID or nested comment ID
//       const activeCommentId = n.commentId || (comment ? comment.id : null);

//       return {
//         _id: n.id,
//         recipient: n.recipientId,
//         type: n.type,
//         isRead: Boolean(n.isRead),
//         postModel: n.postModel || (n.AdminPost ? "AdminPost" : "Post"),
//         language:
//           post && post.language ? post.language : targetLang || "English",
//         postContentSnippet: n.postContentSnippet || "",
//         commentId: activeCommentId
//           ? {
//               _id: activeCommentId,
//               id: activeCommentId,
//               content: comment ? comment.content : "",
//             }
//           : null,
//         sender: sender
//           ? {
//               _id: sender.id,
//               username: sender.username || "",
//               courseType: sender.courseType || "",
//               role: sender.role || "",
//             }
//           : null,
//         postId: post
//           ? {
//               _id: post.id,
//               content: post.content || "",
//               mediaFiles: post.mediaFiles || [],
//               courseType: post.courseType || [],
//               language: post.language || "",
//             }
//           : null,
//         createdAt: n.createdAt,
//         updatedAt: n.updatedAt || n.createdAt,
//       };
//     });

//     return res.status(200).json({
//       success: true,
//       count: notifications.length,
//       data: notifications,
//     });
//   } catch (error) {
//     console.error("Error fetching notifications:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server Error",
//       error: error.message,
//     });
//   }
// });

// app.get("/api/notifications", async (req, res) => {
//   try {
//     const { userId, language } = req.query;

//     const parsedUserId = parseInt(userId, 10);
//     if (!userId || isNaN(parsedUserId) || parsedUserId <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: "userId query parameter is required and must be a valid ID.",
//       });
//     }

//     // 1. Verify current logged-in user profile
//     const user = await User.findByPk(parsedUserId, {
//       attributes: ["id", "role", "language"],
//     });

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found.",
//       });
//     }

//     let targetLang = null;
//     const langInput = language || user.language;

//     if (langInput) {
//       const lower = langInput.toLowerCase();
//       if (lower === "telugu" || lower === "te") targetLang = "Telugu";
//       if (lower === "english" || lower === "en") targetLang = "English";
//     }

//     // 2. Fetch user's notifications including both Comment and AdminComment associations
//     const notificationsData = await Notification.findAll({
//       where: {
//         recipientId: parsedUserId,
//       },
//       order: [["createdAt", "DESC"]],
//       include: [
//         {
//           model: User,
//           as: "sender",
//           attributes: ["id", "username", "courseType", "role"],
//           required: false,
//         },
//         {
//           model: Post,
//           attributes: ["id", "content", "mediaFiles", "courseType", "language"],
//           required: false,
//         },
//         {
//           model: AdminPost,
//           attributes: ["id", "content", "mediaFiles", "courseType", "language"],
//           required: false,
//         },
//         {
//           model: Comment,
//           attributes: ["id", "content", "userId", "parentId"],
//           required: false,
//         },
//         {
//           model: AdminComment,
//           attributes: ["id", "content", "userId", "parentId"],
//           required: false,
//         },
//       ],
//     });

//     // 3. Construct response object and format comment details dynamically
//     console.log("notificationsData", notificationsData);
//     const notifications = notificationsData.map((instance) => {
//       const n = instance.toJSON();
//       const sender = n.sender || n.User;
//       const post = n.AdminPost || n.adminPost || n.Post || n.post;
//       const comment =
//         n.AdminComment || n.adminComment || n.Comment || n.comment;

//       const resolvedCommentId = n.commentId || (comment ? comment.id : null);

//       return {
//         _id: n.id,
//         recipient: n.recipientId,
//         type: n.type,
//         isRead: Boolean(n.isRead),
//         postModel: n.postModel || (n.AdminPost ? "AdminPost" : "Post"),
//         language:
//           post && post.language ? post.language : targetLang || "English",
//         postContentSnippet: n.postContentSnippet || "",
//         commentId: resolvedCommentId
//           ? {
//               _id: resolvedCommentId,
//               id: resolvedCommentId,
//               content: comment ? comment.content : "",
//             }
//           : null,
//         sender: sender
//           ? {
//               _id: sender.id,
//               username: sender.username || "",
//               courseType: sender.courseType || "",
//               role: sender.role || "",
//             }
//           : null,
//         postId: post
//           ? {
//               _id: post.id,
//               content: post.content || "",
//               mediaFiles: post.mediaFiles || [],
//               courseType: post.courseType || [],
//               language: post.language || "",
//             }
//           : null,
//         createdAt: n.createdAt,
//         updatedAt: n.updatedAt || n.createdAt,
//       };
//     });

//     return res.status(200).json({
//       success: true,
//       count: notifications.length,
//       data: notifications,
//     });
//   } catch (error) {
//     console.error("Error fetching notifications:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server Error",
//       error: error.message,
//     });
//   }
// });

// app.get("/api/notifications", async (req, res) => {
//   try {
//     const { userId, language } = req.query;

//     const parsedUserId = parseInt(userId, 10);
//     if (!userId || isNaN(parsedUserId) || parsedUserId <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: "userId query parameter is required and must be a valid ID.",
//       });
//     }

//     // 1. Verify current logged-in user profile
//     const user = await User.findByPk(parsedUserId, {
//       attributes: ["id", "role", "language"],
//     });

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found.",
//       });
//     }

//     let targetLang = null;
//     const langInput = language || user.language;

//     if (langInput) {
//       const lower = langInput.toLowerCase();
//       if (lower === "telugu" || lower === "te") targetLang = "Telugu";
//       if (lower === "english" || lower === "en") targetLang = "English";
//     }

//     // 2. Fetch user's notifications with eager-loaded associations
//     const notificationsData = await Notification.findAll({
//       where: {
//         recipientId: parsedUserId,
//       },
//       order: [["createdAt", "DESC"]],
//       include: [
//         {
//           model: User,
//           as: "sender",
//           attributes: ["id", "username", "courseType", "role"],
//           required: false,
//         },
//         {
//           model: Post,
//           attributes: ["id", "content", "mediaFiles", "courseType", "language"],
//           required: false,
//         },
//         {
//           model: AdminPost,
//           attributes: ["id", "content", "mediaFiles", "courseType", "language"],
//           required: false,
//         },
//         {
//           model: Comment,
//           attributes: ["id", "content", "userId", "parentId"],
//           required: false,
//         },
//         {
//           model: AdminComment,
//           attributes: ["id", "content", "userId", "parentId"],
//           required: false,
//         },
//       ],
//     });

//     // 3. Map polymorphic responses
//     const notifications = notificationsData.map((instance) => {
//       const n = instance.toJSON();
//       const sender = n.sender || n.User;
//       const post = n.AdminPost || n.adminPost || n.Post || n.post;
//       const comment =
//         n.AdminComment || n.adminComment || n.Comment || n.comment;

//       const resolvedCommentId = n.commentId || (comment ? comment.id : null);

//       return {
//         _id: n.id,
//         recipient: n.recipientId,
//         type: n.type,
//         isRead: Boolean(n.isRead),
//         postModel: n.postModel || (n.AdminPost ? "AdminPost" : "Post"),
//         language:
//           post && post.language ? post.language : targetLang || "English",
//         postContentSnippet: n.postContentSnippet || "",
//         commentId: resolvedCommentId
//           ? {
//               _id: resolvedCommentId,
//               id: resolvedCommentId,
//               content: comment ? comment.content : "",
//             }
//           : null,
//         sender: sender
//           ? {
//               _id: sender.id,
//               username: sender.username || "",
//               courseType: sender.courseType || "",
//               role: sender.role || "",
//             }
//           : null,
//         postId: post
//           ? {
//               _id: post.id,
//               content: post.content || "",
//               mediaFiles: post.mediaFiles || [],
//               courseType: post.courseType || [],
//               language: post.language || "",
//             }
//           : null,
//         createdAt: n.createdAt,
//         updatedAt: n.updatedAt || n.createdAt,
//       };
//     });

//     return res.status(200).json({
//       success: true,
//       count: notifications.length,
//       data: notifications,
//     });
//   } catch (error) {
//     console.error("Error fetching notifications:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server Error",
//       error: error.message,
//     });
//   }
// });

// app.get("/api/notifications", async (req, res) => {
//   try {
//     const { userId, language } = req.query;

//     const parsedUserId = parseInt(userId, 10);
//     if (!userId || isNaN(parsedUserId) || parsedUserId <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: "userId query parameter is required and must be a valid ID.",
//       });
//     }

//     // 1. Verify target user
//     const user = await User.findByPk(parsedUserId, {
//       attributes: ["id", "role", "language"],
//     });

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found.",
//       });
//     }

//     let targetLang = null;
//     const langInput = language || user.language;

//     if (langInput) {
//       const lower = langInput.toLowerCase();
//       if (lower === "telugu" || lower === "te") targetLang = "Telugu";
//       if (lower === "english" || lower === "en") targetLang = "English";
//     }

//     // 2. Fetch notifications with polymorphic includes
//     const notificationsData = await Notification.findAll({
//       where: {
//         recipientId: parsedUserId,
//       },
//       order: [["createdAt", "DESC"]],
//       include: [
//         {
//           model: User,
//           as: "sender",
//           attributes: ["id", "username", "courseType", "role"],
//           required: false,
//         },
//         {
//           model: Post,
//           attributes: ["id", "content", "mediaFiles", "courseType", "language"],
//           required: false,
//         },
//         {
//           model: AdminPost,
//           attributes: ["id", "content", "mediaFiles", "courseType", "language"],
//           required: false,
//         },
//         {
//           model: Comment,
//           attributes: ["id", "content", "userId", "parentId"],
//           required: false,
//         },
//         {
//           model: AdminComment,
//           attributes: ["id", "content", "userId", "parentId"],
//           required: false,
//         },
//       ],
//     });

//     // 3. Format response structure
//     const notifications = notificationsData.map((instance) => {
//       const n = instance.toJSON();
//       const sender = n.sender || n.User;
//       const post = n.AdminPost || n.adminPost || n.Post || n.post;
//       const comment =
//         n.AdminComment || n.adminComment || n.Comment || n.comment;

//       const resolvedCommentId = n.commentId || (comment ? comment.id : null);

//       return {
//         _id: n.id,
//         recipient: n.recipientId,
//         type: n.type,
//         isRead: Boolean(n.isRead),
//         postModel: n.postModel || (n.AdminPost ? "AdminPost" : "Post"),
//         language:
//           post && post.language ? post.language : targetLang || "English",
//         postContentSnippet: n.postContentSnippet || "",
//         commentId: resolvedCommentId
//           ? {
//               _id: resolvedCommentId,
//               id: resolvedCommentId,
//               content: comment ? comment.content : "",
//             }
//           : null,
//         sender: sender
//           ? {
//               _id: sender.id,
//               username: sender.username || "",
//               courseType: sender.courseType || "",
//               role: sender.role || "",
//             }
//           : null,
//         postId: post
//           ? {
//               _id: post.id,
//               content: post.content || "",
//               mediaFiles: post.mediaFiles || [],
//               courseType: post.courseType || [],
//               language: post.language || "",
//             }
//           : null,
//         createdAt: n.createdAt,
//         updatedAt: n.updatedAt || n.createdAt,
//       };
//     });

//     return res.status(200).json({
//       success: true,
//       count: notifications.length,
//       data: notifications,
//     });
//   } catch (error) {
//     console.error("Error fetching notifications:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server Error",
//       error: error.message,
//     });
//   }
// });

app.get("/api/notifications", async (req, res) => {
  try {
    const { userId, language, unreadOnly = "true" } = req.query;

    const parsedUserId = parseInt(userId, 10);
    if (!userId || isNaN(parsedUserId) || parsedUserId <= 0) {
      return res.status(400).json({
        success: false,
        message: "userId query parameter is required and must be a valid ID.",
      });
    }

    // 1. Verify target user
    const user = await User.findByPk(parsedUserId, {
      attributes: ["id", "role", "language"],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    let targetLang = null;
    const langInput = language || user.language;

    if (langInput) {
      const lower = langInput.toLowerCase();
      if (lower === "telugu" || lower === "te") targetLang = "Telugu";
      if (lower === "english" || lower === "en") targetLang = "English";
    }

    // 2. Build where filter condition
    const whereCondition = {
      recipientId: parsedUserId,
    };

    // Defaults to fetching only unread notifications (isRead: false)
    if (unreadOnly === "true") {
      whereCondition.isRead = false;
    }

    // 3. Fetch notifications with polymorphic includes
    const notificationsData = await Notification.findAll({
      where: whereCondition,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "username", "courseType", "role"],
          required: false,
        },
        {
          model: Post,
          attributes: ["id", "content", "mediaFiles", "courseType", "language"],
          required: false,
        },
        {
          model: AdminPost,
          attributes: ["id", "content", "mediaFiles", "courseType", "language"],
          required: false,
        },
        {
          model: Comment,
          attributes: ["id", "content", "userId", "parentId"],
          required: false,
        },
        {
          model: AdminComment,
          attributes: ["id", "content", "userId", "parentId"],
          required: false,
        },
      ],
    });

    // 4. Format response structure
    const notifications = notificationsData.map((instance) => {
      const n = instance.toJSON();
      const sender = n.sender || n.User;
      const post = n.AdminPost || n.adminPost || n.Post || n.post;
      const comment =
        n.AdminComment || n.adminComment || n.Comment || n.comment;

      const resolvedCommentId = n.commentId || (comment ? comment.id : null);

      return {
        _id: n.id,
        recipient: n.recipientId,
        type: n.type,
        isRead: Boolean(n.isRead),
        postModel: n.postModel || (n.AdminPost ? "AdminPost" : "Post"),
        language:
          post && post.language ? post.language : targetLang || "English",
        postContentSnippet: n.postContentSnippet || "",
        commentId: resolvedCommentId
          ? {
              _id: resolvedCommentId,
              id: resolvedCommentId,
              content: comment ? comment.content : "",
            }
          : null,
        sender: sender
          ? {
              _id: sender.id,
              username: sender.username || "",
              courseType: sender.courseType || "",
              role: sender.role || "",
            }
          : null,
        postId: post
          ? {
              _id: post.id,
              content: post.content || "",
              mediaFiles: post.mediaFiles || [],
              courseType: post.courseType || [],
              language: post.language || "",
            }
          : null,
        createdAt: n.createdAt,
        updatedAt: n.updatedAt || n.createdAt,
      };
    });

    return res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
});
/**
 * @route   PATCH /api/notifications/:id/read
 * @desc    Mark a specific notification as read
 * @access  Private
 */
// app.patch("/api/notifications/:id/read", async (req, res) => {
//   try {
//     const { id } = req.params;

//     const parsedId = parseInt(id, 10);
//     if (isNaN(parsedId) || parsedId <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid notification ID format",
//       });
//     }

//     // 1. Update the notification's read status
//     const [updateResult] = await db.execute(
//       `UPDATE notifications
//        SET isRead = 1, updated_at = CURRENT_TIMESTAMP
//        WHERE id = ?`,
//       [parsedId],
//     );

//     if (updateResult.affectedRows === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "Notification not found.",
//       });
//     }

//     // 2. Fetch the updated notification record to match Mongoose { new: true } response
//     const [rows] = await db.execute(
//       `SELECT
//         id AS _id,
//         recipientId AS recipient,
//         senderId,
//         postId,
//         type,
//         isRead,
//         created_at AS createdAt,
//         updated_at AS updatedAt
//        FROM notifications
//        WHERE id = ?`,
//       [parsedId],
//     );

//     const notification = {
//       ...rows[0],
//       isRead: Boolean(rows[0].isRead),
//     };

//     return res.status(200).json({
//       success: true,
//       message: "Notification marked as read.",
//       data: notification,
//     });
//   } catch (error) {
//     console.error("Error updating notification:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server Error",
//       error: error.message,
//     });
//   }
// });

app.patch("/api/notifications/:id/read", async (req, res) => {
  try {
    const { id } = req.params;

    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId) || parsedId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID format",
      });
    }

    // 1. Fetch notification instance
    const notification = await Notification.findByPk(parsedId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    // 2. Update status (Sequelize automatically manages updatedAt timestamp)
    await notification.update({ isRead: true });

    // 3. Format response object to match legacy schema
    const formattedNotification = {
      _id: notification.id,
      recipient: notification.recipientId,
      senderId: notification.senderId,
      postId: notification.postId,
      type: notification.type,
      isRead: Boolean(notification.isRead),
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
    };

    return res.status(200).json({
      success: true,
      message: "Notification marked as read.",
      data: formattedNotification,
    });
  } catch (error) {
    console.error("Error updating notification:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
});

// PATCH /api/notifications/read-all
// app.patch("/api/notifications/read-all", async (req, res) => {
//   try {
//     const { userId } = req.query;

//     if (!userId) {
//       return res
//         .status(400)
//         .json({ success: false, message: "User ID is required" });
//     }

//     // Matches 'recipientId' in your Notification model definition
//     const [updatedCount] = await Notification.update(
//       { isRead: true },
//       {
//         where: {
//           recipientId: userId,
//           isRead: false,
//         },
//       }
//     );

//     return res.status(200).json({
//       success: true,
//       message: "All notifications marked as read",
//       updatedCount,
//     });
//   } catch (error) {
//     console.error("Error in read-all:", error);
//     return res.status(500).json({ success: false, error: error.message });
//   }
// });

app.patch("/api/notifications/read-all", async (req, res) => {
  try {
    const { userId } = req.query;
    const parsedUserId = parseInt(userId, 10);

    if (!userId || isNaN(parsedUserId)) {
      return res
        .status(400)
        .json({ success: false, message: "Valid User ID is required" });
    }

    const [updatedCount] = await Notification.update(
      { isRead: true },
      {
        where: {
          recipientId: parsedUserId,
          isRead: false,
        },
      },
    );

    console.log(
      `Marked ${updatedCount} notifications as read for user ${parsedUserId}`,
    );

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
      updatedCount,
    });
  } catch (error) {
    console.error("Error in read-all:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Helper utility to extract S3 Object Key from a Full S3 URL
 */
const getS3KeyFromUrl = (fileUrl) => {
  try {
    const parsedUrl = new URL(fileUrl);
    // Remove leading slash to get the S3 key
    return decodeURIComponent(parsedUrl.pathname.substring(1));
  } catch (error) {
    console.error("Error parsing S3 URL:", error);
    return null;
  }
};

// sql
// app.put("/api/posts/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const {
//       userId,
//       content,
//       tagIds,
//       fileLink,
//       fileLinks,
//       targetLanguage,
//       removedMediaIds,
//     } = req.body;

//     // 1. Fetch post to update from MySQL
//     const [posts] = await db.execute(
//       "SELECT id, userId, content, language, tagIds, mediaFiles FROM posts WHERE id = ?",
//       [id],
//     );

//     if (!posts || posts.length === 0) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Post not found" });
//     }

//     const post = posts[0];

//     // 2. Fetch editor user details
//     const [users] = await db.execute(
//       "SELECT id, role, language FROM register WHERE id = ?",
//       [userId],
//     );

//     if (!users || users.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "User making the edit not found in database.",
//       });
//     }

//     const author = users[0];

//     // 3. Authorization check
//     const isOwner = post.userId
//       ? String(post.userId) === String(author.id)
//       : false;
//     const isAdmin =
//       String(author.role || "")
//         .toLowerCase()
//         .trim() === "admin";

//     if (!isOwner && !isAdmin) {
//       return res
//         .status(403)
//         .json({ success: false, message: "Unauthorized action" });
//     }

//     // Parse existing JSON structures stored in MySQL
//     let currentTagIds = [];
//     try {
//       currentTagIds =
//         typeof post.tagIds === "string"
//           ? JSON.parse(post.tagIds || "[]")
//           : post.tagIds || [];
//     } catch {
//       currentTagIds = [];
//     }

//     let currentMediaFiles = [];
//     try {
//       currentMediaFiles =
//         typeof post.mediaFiles === "string"
//           ? JSON.parse(post.mediaFiles || "[]")
//           : post.mediaFiles || [];
//     } catch {
//       currentMediaFiles = [];
//     }

//     // 4. Update text content & language preferences
//     let updatedContent = content !== undefined ? content : post.content;
//     let updatedLanguage = post.language;

//     if (isAdmin && targetLanguage) {
//       updatedLanguage = targetLanguage;
//     } else if (author.language) {
//       updatedLanguage = author.language;
//     }

//     if (tagIds !== undefined) {
//       try {
//         currentTagIds =
//           typeof tagIds === "string" ? JSON.parse(tagIds) : tagIds;
//       } catch {
//         currentTagIds = [];
//       }
//     }

//     // 5. Detect media removal request from frontend payload
//     let isRemovalRequested = false;

//     if (removedMediaIds) {
//       let parsedRemoved = [];
//       try {
//         parsedRemoved =
//           typeof removedMediaIds === "string"
//             ? JSON.parse(removedMediaIds)
//             : removedMediaIds;
//       } catch {
//         parsedRemoved = [removedMediaIds];
//       }

//       // Check if removedMediaIds array contains null, undefined, or "null" string
//       if (Array.isArray(parsedRemoved)) {
//         isRemovalRequested = parsedRemoved.some(
//           (val) => val === null || val === undefined || val === "null",
//         );
//       }
//     }

//     // Also trigger removal if fileLink is explicitly passed as empty string or null
//     if (fileLink === "" || fileLink === null) {
//       isRemovalRequested = true;
//     }

//     const updatedMediaFiles = [];

//     // Process existing media files stored in MySQL
//     for (const file of currentMediaFiles) {
//       const currentUrl = String(file.fileLink || file.url || "").trim();

//       if (isRemovalRequested) {
//         // Delete file from AWS S3
//         const s3Key = getS3KeyFromUrl(currentUrl);
//         if (s3Key) {
//           try {
//             await s3.send(
//               new DeleteObjectCommand({
//                 Bucket: process.env.AWS_BUCKET_NAME,
//                 Key: s3Key,
//               }),
//             );
//             console.log(`Successfully deleted S3 key: ${s3Key}`);
//           } catch (s3Err) {
//             console.error(`Failed to delete S3 key (${s3Key}):`, s3Err);
//           }
//         }
//         // Excluded from updatedMediaFiles (removes from MySQL JSON array)
//       } else {
//         // Keep file if no removal was requested
//         updatedMediaFiles.push(file);
//       }
//     }

//     currentMediaFiles = updatedMediaFiles;

//     // 6. Append new S3 media URLs if provided as non-empty strings
//     const rawLinks = fileLinks
//       ? Array.isArray(fileLinks)
//         ? fileLinks
//         : [fileLinks]
//       : fileLink
//         ? [fileLink]
//         : [];

//     const newUploadedMedia = rawLinks
//       .filter((link) => typeof link === "string" && link.trim() !== "")
//       .map((link, idx) => ({
//         id: Date.now() + idx,
//         _id: String(Date.now() + idx),
//         fileLink: link.trim(),
//         mediaType: getMediaTypeFromUrl(link.trim()),
//       }));

//     if (newUploadedMedia.length > 0) {
//       currentMediaFiles.push(...newUploadedMedia);
//     }

//     // 7. Execute UPDATE in MySQL
//     await db.execute(
//       `UPDATE posts
//        SET content = ?, language = ?, tagIds = ?, mediaFiles = ?, updated_at = CURRENT_TIMESTAMP
//        WHERE id = ?`,
//       [
//         updatedContent,
//         updatedLanguage,
//         JSON.stringify(currentTagIds),
//         JSON.stringify(currentMediaFiles),
//         id,
//       ],
//     );

//     // 8. Fetch and return updated post record
//     const [updatedRows] = await db.execute("SELECT * FROM posts WHERE id = ?", [
//       id,
//     ]);

//     return res.status(200).json({
//       success: true,
//       message: "Post updated successfully",
//       data: {
//         ...updatedRows[0],
//         tagIds: currentTagIds,
//         mediaFiles: currentMediaFiles,
//       },
//     });
//   } catch (error) {
//     console.error("Error updating post:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server Error",
//       error: error.message,
//     });
//   }
// });

app.put("/api/posts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      userId,
      content,
      tagIds,
      fileLink,
      fileLinks,
      targetLanguage,
      removedMediaIds,
    } = req.body;

    // 1. Fetch post instance from Sequelize
    const post = await Post.findByPk(id);

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    // 2. Fetch editor user details
    const author = await User.findByPk(userId, {
      attributes: ["id", "role", "language"],
    });

    if (!author) {
      return res.status(404).json({
        success: false,
        message: "User making the edit not found in database.",
      });
    }

    // 3. Authorization check
    const isOwner = post.userId
      ? String(post.userId) === String(author.id)
      : false;
    const isAdmin =
      String(author.role || "")
        .toLowerCase()
        .trim() === "admin";

    if (!isOwner && !isAdmin) {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized action" });
    }

    // Sequelize automatically handles JSON array parsing
    let currentTagIds = Array.isArray(post.tagIds) ? post.tagIds : [];
    let currentMediaFiles = Array.isArray(post.mediaFiles)
      ? post.mediaFiles
      : [];

    // 4. Update text content & language preferences
    let updatedContent = content !== undefined ? content : post.content;
    let updatedLanguage = post.language;

    if (isAdmin && targetLanguage) {
      updatedLanguage = targetLanguage;
    } else if (author.language) {
      updatedLanguage = author.language;
    }

    if (tagIds !== undefined) {
      try {
        currentTagIds =
          typeof tagIds === "string" ? JSON.parse(tagIds) : tagIds;
      } catch {
        currentTagIds = [];
      }
    }

    // 5. Detect media removal request from frontend payload
    let isRemovalRequested = false;

    if (removedMediaIds) {
      let parsedRemoved = [];
      try {
        parsedRemoved =
          typeof removedMediaIds === "string"
            ? JSON.parse(removedMediaIds)
            : removedMediaIds;
      } catch {
        parsedRemoved = [removedMediaIds];
      }

      if (Array.isArray(parsedRemoved)) {
        isRemovalRequested = parsedRemoved.some(
          (val) => val === null || val === undefined || val === "null",
        );
      }
    }

    if (fileLink === "" || fileLink === null) {
      isRemovalRequested = true;
    }

    const updatedMediaFiles = [];

    // Process existing media files
    for (const file of currentMediaFiles) {
      const currentUrl = String(file.fileLink || file.url || "").trim();

      if (isRemovalRequested) {
        // Delete file from AWS S3
        const s3Key = getS3KeyFromUrl(currentUrl);
        if (s3Key) {
          try {
            await s3.send(
              new DeleteObjectCommand({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: s3Key,
              }),
            );
            console.log(`Successfully deleted S3 key: ${s3Key}`);
          } catch (s3Err) {
            console.error(`Failed to delete S3 key (${s3Key}):`, s3Err);
          }
        }
      } else {
        updatedMediaFiles.push(file);
      }
    }

    currentMediaFiles = updatedMediaFiles;

    // 6. Append new S3 media URLs if provided
    const rawLinks = fileLinks
      ? Array.isArray(fileLinks)
        ? fileLinks
        : [fileLinks]
      : fileLink
        ? [fileLink]
        : [];

    const newUploadedMedia = rawLinks
      .filter((link) => typeof link === "string" && link.trim() !== "")
      .map((link, idx) => ({
        id: Date.now() + idx,
        _id: String(Date.now() + idx),
        fileLink: link.trim(),
        mediaType: getMediaTypeFromUrl(link.trim()),
      }));

    if (newUploadedMedia.length > 0) {
      currentMediaFiles.push(...newUploadedMedia);
    }

    // 7. Update post in Sequelize
    await post.update({
      content: updatedContent,
      language: updatedLanguage,
      tagIds: currentTagIds,
      mediaFiles: currentMediaFiles,
    });

    return res.status(200).json({
      success: true,
      message: "Post updated successfully",
      data: {
        ...post.toJSON(),
        tagIds: currentTagIds,
        mediaFiles: currentMediaFiles,
      },
    });
  } catch (error) {
    console.error("Error updating post:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
});

// sql
// app.delete("/api/posts/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const userId = req.query.userid || req.query.userId;

//     // 1. Fetch post to get owner info and media files
//     const [posts] = await db.execute(
//       "SELECT id, userId, mediaFiles FROM posts WHERE id = ?",
//       [id],
//     );

//     if (!posts || posts.length === 0) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Post not found" });
//     }

//     const post = posts[0];

//     // 2. Authorization check
//     const postUserId = post.userId ? String(post.userId) : "";
//     const incomingUserId = userId ? String(userId) : "";

//     if (!incomingUserId || postUserId !== incomingUserId) {
//       return res
//         .status(403)
//         .json({ success: false, message: "Unauthorized action" });
//     }

//     // 3. Parse media files JSON and delete from AWS S3
//     let mediaFiles = [];
//     try {
//       mediaFiles =
//         typeof post.mediaFiles === "string"
//           ? JSON.parse(post.mediaFiles || "[]")
//           : post.mediaFiles || [];
//     } catch {
//       mediaFiles = [];
//     }

//     if (Array.isArray(mediaFiles) && mediaFiles.length > 0) {
//       for (const file of mediaFiles) {
//         const fileUrl = file.fileLink || file.url || file.path;
//         const s3Key = getS3KeyFromUrl(fileUrl);

//         if (s3Key) {
//           try {
//             await s3.send(
//               new DeleteObjectCommand({
//                 Bucket: process.env.AWS_BUCKET_NAME,
//                 Key: s3Key,
//               }),
//             );
//             console.log(`Successfully deleted S3 key: ${s3Key}`);
//           } catch (s3Err) {
//             console.error(`Failed to delete S3 key (${s3Key}):`, s3Err);
//           }
//         }
//       }
//     }

//     // 4. Delete associated comments first (if not handled by ON DELETE CASCADE)
//     await db.execute("DELETE FROM comments WHERE postId = ?", [id]);

//     // 5. Delete post record from MySQL
//     await db.execute("DELETE FROM posts WHERE id = ?", [id]);

//     return res.status(200).json({
//       success: true,
//       message: "Post and S3 media deleted successfully",
//     });
//   } catch (error) {
//     console.error("Error deleting post:", error);
//     return res.status(500).json({ success: false, error: error.message });
//   }
// });

app.delete("/api/posts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.query.userid || req.query.userId;

    // 1. Fetch post to get owner info and media files
    const post = await Post.findByPk(id);

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    // 2. Authorization check
    const postUserId = post.userId ? String(post.userId) : "";
    const incomingUserId = userId ? String(userId) : "";

    if (!incomingUserId || postUserId !== incomingUserId) {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized action" });
    }

    // 3. Delete attached media files from AWS S3
    const mediaFiles = Array.isArray(post.mediaFiles) ? post.mediaFiles : [];

    if (mediaFiles.length > 0) {
      for (const file of mediaFiles) {
        const fileUrl = file.fileLink || file.url || file.path;
        const s3Key = getS3KeyFromUrl(fileUrl);

        if (s3Key) {
          try {
            await s3.send(
              new DeleteObjectCommand({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: s3Key,
              }),
            );
            console.log(`Successfully deleted S3 key: ${s3Key}`);
          } catch (s3Err) {
            console.error(`Failed to delete S3 key (${s3Key}):`, s3Err);
          }
        }
      }
    }

    // 4 & 5. Delete associated comments and post inside an atomic transaction
    await sequelize.transaction(async (t) => {
      await Comment.destroy({
        where: { postId: id },
        transaction: t,
      });

      await post.destroy({ transaction: t });
    });

    return res.status(200).json({
      success: true,
      message: "Post and S3 media deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting post:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// GET COURSES
app.get("/api/courses", async (req, res) => {
  try {
    const { courseType, role, language } = req.query;
    const formattedLang = language;

    const whereClause = {};

    if (formattedLang) {
      whereClause.language = formattedLang;
    }

    // Filter for non-admin students based on their enrolled courseType
    if (role !== "admin") {
      if (!courseType) {
        return res.status(200).json({
          success: true,
          count: 0,
          data: [],
        });
      }

      whereClause.title = courseType.trim();
    }

    const courses = await Course.findAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while fetching courses",
    });
  }
});

// CREATE COURSE
app.post("/api/courses", async (req, res) => {
  try {
    const {
      title,
      description,
      instructor,
      thumbnail,
      isPaid,
      isNewCourse,
      language,
    } = req.body;

    if (!thumbnail || typeof thumbnail !== "string" || !thumbnail.trim()) {
      return res.status(400).json({
        success: false,
        message: "Thumbnail URL is required.",
      });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Course title is required.",
      });
    }

    const formattedLang = language;
    if (!formattedLang) {
      return res.status(400).json({
        success: false,
        message: "Valid language ('English' or 'Telugu') is required.",
      });
    }

    const savedCourse = await Course.create({
      title: title.trim(),
      description,
      instructor: instructor || "Pooja Agarwala",
      thumbnail: thumbnail.trim(),
      isPaid: isPaid === "true" || isPaid === true,
      isNewCourse: isNewCourse === "true" || isNewCourse === true,
      language: formattedLang,
      progress: 0,
      status: "not_started",
    });

    return res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: savedCourse,
    });
  } catch (error) {
    console.error("Error creating course:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while creating course",
    });
  }
});

// UPDATE COURSE
app.put("/api/courses/:id", async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Update string and numeric fields if provided
    if (req.body.title !== undefined) course.title = req.body.title.trim();
    if (req.body.description !== undefined)
      course.description = req.body.description;
    if (req.body.instructor !== undefined)
      course.instructor = req.body.instructor;
    if (req.body.status !== undefined) course.status = req.body.status;
    if (req.body.progress !== undefined)
      course.progress = Number(req.body.progress);
    if (req.body.language !== undefined) course.language = req.body.language;

    // Handle boolean flags
    if (req.body.isPaid !== undefined) {
      course.isPaid = req.body.isPaid === "true" || req.body.isPaid === true;
    }
    if (req.body.isNewCourse !== undefined) {
      course.isNewCourse =
        req.body.isNewCourse === "true" || req.body.isNewCourse === true;
    }

    // Clean up old S3 file if a new thumbnail URL is provided and differs from existing
    if (req.body.thumbnail && req.body.thumbnail !== course.thumbnail) {
      if (course.thumbnail) {
        const oldS3Key = getS3KeyFromUrl(course.thumbnail);
        if (oldS3Key) {
          try {
            await s3.send(
              new DeleteObjectCommand({
                Bucket: process.env.AWS_BUCKET_NAME || bucketName,
                Key: oldS3Key,
              }),
            );
            console.log(`Deleted old thumbnail S3 key: ${oldS3Key}`);
          } catch (s3Err) {
            console.error(`Failed to delete old S3 key (${oldS3Key}):`, s3Err);
          }
        }
      }
      course.thumbnail = req.body.thumbnail.trim();
    }

    const updatedCourse = await course.save();

    return res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    });
  } catch (error) {
    console.error("Error updating course:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while updating course",
    });
  }
});

// DELETE COURSE
app.delete("/api/courses/:id", async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found.",
      });
    }

    // 1. Delete thumbnail file from disk storage if present
    if (course.thumbnail) {
      const fileName = course.thumbnail.split("/uploads/").pop();
      if (fileName) {
        const filePath = path.join(process.cwd(), "uploads", fileName);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }

    // 2. Remove record from database
    await course.destroy();

    return res.status(200).json({
      success: true,
      message: "Course and thumbnail deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while deleting course.",
    });
  }
});

// sql
// CREATE SESSION
app.post("/api/session", async (req, res) => {
  try {
    const {
      title,
      date,
      startTime,
      endTime,
      occurrence,
      linkTypeNote,
      meetingUrl,
      courseType,
      language,
    } = req.body;

    const formattedLang = language;

    if (
      !title ||
      !date ||
      !startTime ||
      !endTime ||
      !meetingUrl ||
      !courseType ||
      !formattedLang
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields." });
    }

    const savedSession = await LiveSession.create({
      title,
      date,
      startTime,
      endTime,
      occurrence,
      linkTypeNote,
      meetingUrl,
      courseType,
      language: formattedLang,
    });

    return res.status(201).json({ success: true, data: savedSession });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET SESSIONS
app.get("/api/session", async (req, res) => {
  try {
    const { language, courseType, role } = req.query;

    const whereClause = {};

    // 1. Language filter (applies to both Users and Admins)
    if (language) {
      const lower = language.toLowerCase();
      if (lower === "te" || lower === "telugu") whereClause.language = "Telugu";
      else if (lower === "en" || lower === "english")
        whereClause.language = "English";
      else whereClause.language = language;
    }

    // 2. CourseType filter (ONLY applied if user is NOT an admin)
    const isAdmin = role && role.toLowerCase() === "admin";
    if (!isAdmin && courseType) {
      whereClause.courseType = courseType;
    }

    const sessions = await LiveSession.findAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({ success: true, data: sessions });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// UPDATE SESSION
app.put("/api/session/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.language) {
      updateData.language = updateData.language;
    }

    const session = await LiveSession.findByPk(id);

    if (!session) {
      return res
        .status(404)
        .json({ success: false, message: "Session not found." });
    }

    const updatedSession = await session.update(updateData);

    return res.status(200).json({ success: true, data: updatedSession });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE SESSION
app.delete("/api/session/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const session = await LiveSession.findByPk(id);

    if (!session) {
      return res
        .status(404)
        .json({ success: false, message: "Session not found." });
    }

    await session.destroy();

    return res
      .status(200)
      .json({ success: true, message: "Session deleted successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

app.get("/api/products", async (req, res) => {
  try {
    const { language } = req.query;
    const formattedLang = language;

    const whereClause = {};
    if (formattedLang) whereClause.language = formattedLang;

    const products = await Product.findAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    return res
      .status(200)
      .json({ success: true, count: products.length, data: products });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST: Admin create new product link with language
app.post("/api/products", async (req, res) => {
  try {
    const { title, productUrl, imageUrl, language } = req.body;
    const formattedLang = language;

    if (!title || !productUrl || !imageUrl || !formattedLang) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields including language.",
      });
    }

    const savedProduct = await Product.create({
      title,
      productUrl,
      imageUrl,
      language: formattedLang,
    });

    return res.status(201).json({ success: true, data: savedProduct });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// PUT: Admin update existing product
app.put("/api/products/:id", async (req, res) => {
  try {
    const { title, productUrl, imageUrl, language } = req.body;

    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found." });
    }

    if (title) product.title = title;
    if (productUrl) product.productUrl = productUrl;
    if (imageUrl) product.imageUrl = imageUrl;
    if (language) product.language = language;

    await product.save();

    return res.status(200).json({ success: true, data: product });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE: Admin remove product
app.delete("/api/products/:id", async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found." });
    }

    await product.destroy();

    return res
      .status(200)
      .json({ success: true, message: "Product deleted successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET user tracker data
// app.get("/api/tracker-status/:userId", async (req, res) => {
//   const now = new Date();
//   const year = now.getFullYear();
//   const month = String(now.getMonth() + 1).padStart(2, "0");
//   const day = String(now.getDate()).padStart(2, "0");
//   const todayStr = `${year}-${month}-${day}`;
//   try {
//     const user = await User.findById(req.params.userId);

//     if (user.completedPracticeDates.includes(todayStr)) {
//       return res.json({
//         success: true,
//         completedPracticeDates: user.completedPracticeDates,
//         message: "Daily practice already completed for today.",
//       });
//     } else {
//       res.json({
//         success: true,
//         points: user.points,
//         completedPracticeDates: user.completedPracticeDates,
//       });
//     }
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // POST complete today's tracker (Adds +10 points)
// app.post("/api/complete-today", async (req, res) => {
//   const { userId } = req.body;

//   const now = new Date();

//   // Extract YYYY, MM, DD relative to Asia/Kolkata
//   const parts = new Intl.DateTimeFormat("en-US", {
//     timeZone: "Asia/Kolkata",
//     year: "numeric",
//     month: "2-digit",
//     day: "2-digit",
//   }).formatToParts(now);

//   const year = parts.find((p) => p.type === "year").value;
//   const month = parts.find((p) => p.type === "month").value;
//   const day = parts.find((p) => p.type === "day").value;

//   const todayStr = `${year}-${month}-${day}`;

//   try {
//     const user = await User.findByPk(userId);

//     if (!user) {
//       return res
//         .status(404)
//         .json({ success: false, message: "User not found." });
//     }

//     // Parse array if stored as stringified JSON in DB column
//     let completedPracticeDates = user.completedPracticeDates || [];
//     if (typeof completedPracticeDates === "string") {
//       try {
//         completedPracticeDates = JSON.parse(completedPracticeDates);
//       } catch {
//         completedPracticeDates = [];
//       }
//     }

//     // Guard: Prevent double-claiming today
//     console.log("todayStr", todayStr);
//     if (completedPracticeDates.includes(todayStr)) {
//       return res.json({
//         success: true,
//         message: "Daily practice already completed for today.",
//       });
//     }

//     // Append today's date and increment points by 10
//     const updatedDates = [...completedPracticeDates, todayStr];
//     const newPoints = (user.points || 0) + 10;

//     // Direct update to trigger proper change tracking on JSON columns/arrays
//     await user.update({
//       completedPracticeDates: updatedDates,
//       points: newPoints,
//     });

//     return res.json({
//       success: true,
//       points: user.points,
//       completedPracticeDates: user.completedPracticeDates,
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// Shared utility: Formats YYYY-MM-DD specifically for Asia/Kolkata timezone
const getTodayStr = () => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((p) => p.type === "year").value;
  const month = parts.find((p) => p.type === "month").value;
  const day = parts.find((p) => p.type === "day").value;

  return `${year}-${month}-${day}`;
};

// GET user tracker data
app.get("/api/tracker-status/:userId", async (req, res) => {
  const todayStr = getTodayStr();

  try {
    // Replaced Mongoose findById with Sequelize findByPk
    const user = await User.findByPk(req.params.userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    // Safely parse JSON array column if stored as string
    let completedPracticeDates = user.completedPracticeDates || [];
    if (typeof completedPracticeDates === "string") {
      try {
        completedPracticeDates = JSON.parse(completedPracticeDates);
      } catch {
        completedPracticeDates = [];
      }
    }

    const isCompletedToday = completedPracticeDates.includes(todayStr);

    return res.status(200).json({
      success: true,
      points: user.points,
      completedPracticeDates,
      isCompletedToday,
      message: isCompletedToday
        ? "Daily practice already completed for today."
        : "Daily practice pending.",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST complete today's tracker (Adds +10 points)
app.post("/api/complete-today", async (req, res) => {
  const { userId } = req.body;
  const todayStr = getTodayStr();

  try {
    const user = await User.findByPk(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    // Safely parse JSON array column if stored as string
    let completedPracticeDates = user.completedPracticeDates || [];
    if (typeof completedPracticeDates === "string") {
      try {
        completedPracticeDates = JSON.parse(completedPracticeDates);
      } catch {
        completedPracticeDates = [];
      }
    }

    // Guard: Prevent double-claiming today
    if (completedPracticeDates.includes(todayStr)) {
      return res.status(200).json({
        success: true,
        points: user.points,
        completedPracticeDates,
        message: "Daily practice already completed for today.",
      });
    }

    // Append today's date and increment points by 10
    const updatedDates = [...completedPracticeDates, todayStr];
    const newPoints = (user.points || 0) + 10;

    // Direct update triggers proper Sequelize JSON mutation tracking
    await user.update({
      completedPracticeDates: updatedDates,
      points: newPoints,
    });

    return res.status(200).json({
      success: true,
      points: user.points,
      completedPracticeDates: user.completedPracticeDates,
      message: "Tracker marked completed and points added successfully.",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

function getFormattedDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

app.get("/api/leaderboard", async (req, res) => {
  try {
    const { lang } = req.query; // 'English' or 'Telugu'
    const now = new Date();

    // 1. Current Month Prefix (YYYY-MM)
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const currentMonthPrefix = `${year}-${month}`;

    // 2. Current Week Bounds (Monday to Sunday)
    const currentDayOfWeek = now.getDay(); // 0 is Sun, 1 is Mon...
    const distanceToMon = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;

    const monday = new Date(now);
    monday.setDate(now.getDate() + distanceToMon);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const startOfWeekStr = getFormattedDate(monday);
    const endOfWeekStr = getFormattedDate(sunday);

    // Language filter
    const whereClause = {};
    if (lang) {
      whereClause.language = lang;
    }

    // Fetch all matching users
    const users = await User.findAll({
      where: whereClause,
      attributes: [
        "id",
        "username",
        "language",
        "points",
        "completedPracticeDates",
      ],
      raw: true,
    });

    // Compute monthlyCount and weeklyCount per user
    const processedUsers = users.map((user) => {
      let dates = user.completedPracticeDates || [];

      // Handle stringified JSON if column is stored as TEXT in DB
      if (typeof dates === "string") {
        try {
          dates = JSON.parse(dates);
        } catch {
          dates = [];
        }
      }

      const monthlyCount = dates.filter(
        (dateStr) =>
          typeof dateStr === "string" && dateStr.startsWith(currentMonthPrefix),
      ).length;

      const weeklyCount = dates.filter(
        (dateStr) =>
          typeof dateStr === "string" &&
          dateStr >= startOfWeekStr &&
          dateStr <= endOfWeekStr,
      ).length;

      return {
        id: user.id,
        username: user.username,
        language: user.language,
        points: user.points || 0,
        completedPracticeDates: dates,
        monthlyCount,
        weeklyCount,
      };
    });

    // Top 4 All-Time (Sorted by points DESC)
    const allTime = [...processedUsers]
      .sort((a, b) => b.points - a.points)
      .slice(0, 4);

    // Top 4 Monthly (Sorted by monthlyCount DESC, then points DESC)
    const monthly = [...processedUsers]
      .sort((a, b) => b.monthlyCount - a.monthlyCount || b.points - a.points)
      .slice(0, 4);

    // Top 4 Weekly (Sorted by weeklyCount DESC, then points DESC)
    const weekly = [...processedUsers]
      .sort((a, b) => b.weeklyCount - a.weeklyCount || b.points - a.points)
      .slice(0, 4);

    return res.json({
      success: true,
      allTime,
      monthly,
      weekly,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET: Admin fetch users with points & tracker details by language
// app.get("/api/admin-users-tracker", async (req, res) => {
//   try {
//     const { language } = req.query;

//     let formattedLang;
//     if (language) {
//       const lower = language.toLowerCase();
//       if (lower === "te" || lower === "telugu") formattedLang = "Telugu";
//       if (lower === "en" || lower === "english") formattedLang = "English";
//     }

//     const filter = {};
//     if (formattedLang) {
//       filter.language = formattedLang;
//     }

//     // Select fields required for admin list
//     const users = await User.find(filter)
//       .select("username name email points completedPracticeDates language role")
//       .sort({ points: -1 }); // Rank by highest points

//     const formattedData = users.map((u) => ({
//       _id: u._id,
//       name: u.name || u.username || "Student",
//       email: u.email,
//       points: u.points || 0,
//       language: u.language,
//       totalCompletedDays: u.completedPracticeDates
//         ? u.completedPracticeDates.length
//         : 0,
//     }));

//     return res.status(200).json({
//       success: true,
//       count: formattedData.length,
//       data: formattedData,
//     });
//   } catch (err) {
//     return res.status(500).json({ success: false, message: err.message });
//   }
// });

// app.get("/api/admin-users-tracker", async (req, res) => {
//   try {
//     const { language } = req.query;

//     let formattedLang;
//     if (language) {
//       const lower = language.toLowerCase();
//       if (lower === "te" || lower === "telugu") formattedLang = "Telugu";
//       if (lower === "en" || lower === "english") formattedLang = "English";
//     }

//     const whereClause = {};
//     if (formattedLang) {
//       whereClause.language = formattedLang;
//     }

//     // Select required fields and order by highest points
//     const users = await User.findAll({
//       where: whereClause,
//       attributes: [
//         "id",
//         "username",
//         "name",
//         "email",
//         "points",
//         "completedPracticeDates",
//         "language",
//         "role",
//       ],
//       order: [["points", "DESC"]],
//       raw: true,
//     });

//     const formattedData = users.map((u) => {
//       let dates = u.completedPracticeDates || [];

//       // Handle stringified JSON if column is stored as TEXT/VARCHAR in DB
//       if (typeof dates === "string") {
//         try {
//           dates = JSON.parse(dates);
//         } catch {
//           dates = [];
//         }
//       }

//       return {
//         id: u.id,
//         name: u.name || u.username || "Student",
//         email: u.email,
//         points: u.points || 0,
//         language: u.language,
//         totalCompletedDays: Array.isArray(dates) ? dates.length : 0,
//       };
//     });

//     return res.status(200).json({
//       success: true,
//       count: formattedData.length,
//       data: formattedData,
//     });
//   } catch (err) {
//     return res.status(500).json({ success: false, message: err.message });
//   }
// });

// GET /api/admin-users-tracker
app.get("/api/admin-users-tracker", async (req, res) => {
  try {
    const { language } = req.query;

    let formattedLang;
    if (language) {
      const lower = language.toLowerCase();
      if (lower === "te" || lower === "telugu") formattedLang = "Telugu";
      if (lower === "en" || lower === "english") formattedLang = "English";
    }

    const whereClause = {};
    if (formattedLang) {
      whereClause.language = formattedLang;
    }

    // Select valid model fields and order by highest points
    const users = await User.findAll({
      where: whereClause,
      attributes: [
        "id",
        "username",
        "mobile",
        "points",
        "completedPracticeDates",
        "language",
        "role",
      ],
      order: [["points", "DESC"]],
      raw: true,
    });

    const formattedData = users.map((u) => {
      let dates = u.completedPracticeDates || [];

      // Handle stringified JSON if column is stored as TEXT/VARCHAR
      if (typeof dates === "string") {
        try {
          dates = JSON.parse(dates);
        } catch {
          dates = [];
        }
      }

      return {
        id: u.id,
        name: u.username || "Student",
        mobile: u.mobile,
        points: u.points || 0,
        language: u.language,
        role: u.role,
        totalCompletedDays: Array.isArray(dates) ? dates.length : 0,
      };
    });

    return res.status(200).json({
      success: true,
      count: formattedData.length,
      data: formattedData,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// app.post("/api/admin-posts", async (req, res) => {
//   try {
//     const { userId, content, tagIds, fileLink, fileLinks, targetLanguage } =
//       req.body;

//     if (!userId) {
//       return res.status(400).json({
//         success: false,
//         message: "userId is required to create a post.",
//       });
//     }

//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid userId format provided.",
//       });
//     }

//     // 1. Fetch Author (Admin)
//     let author = await User.findById(userId);
//     if (!author) {
//       author = await User.findOne({ role: "admin" });
//     }
//     if (!author) {
//       return res.status(404).json({
//         success: false,
//         message: "Post author not found in database.",
//       });
//     }

//     // 2. Determine target language for the post
//     const postLanguage = targetLanguage || author.language || "English";

//     // Safely parse JSON strings sent from FormData/JSON payload
//     let parsedTagIds = [];
//     if (tagIds) {
//       try {
//         parsedTagIds = typeof tagIds === "string" ? JSON.parse(tagIds) : tagIds;
//       } catch (e) {
//         parsedTagIds = [];
//       }
//     }

//     // 3. Process incoming S3 file URLs (supports single string or array)
//     const rawLinks = fileLinks
//       ? Array.isArray(fileLinks)
//         ? fileLinks
//         : [fileLinks]
//       : fileLink
//         ? [fileLink]
//         : [];

//     const mediaFiles = rawLinks
//       .filter((link) => typeof link === "string" && link.trim() !== "")
//       .map((link) => ({
//         fileLink: link.trim(),
//         mediaType: getMediaTypeFromUrl(link),
//       }));

//     // 4. Save AdminPost with designated language and S3 media URLs
//     const newPost = new AdminPost({
//       userId: author._id,
//       content: content || "",
//       language: postLanguage,
//       tagIds: parsedTagIds,
//       courseType: author.courseType,
//       mediaFiles,
//     });

//     await newPost.save();

//     // 5. STRICT FILTER: Fetch recipients whose language matches postLanguage
//     const targetUsers = await User.find({
//       _id: { $ne: author._id },
//       language: postLanguage,
//     }).select("_id");

//     console.log(`Admin Post Created for Stream: ${postLanguage}`);
//     console.log(`Notifying ${targetUsers.length} ${postLanguage} students.`);

//     // 6. Send notifications to matching students
//     if (targetUsers.length > 0) {
//       const notifications = targetUsers.map((user) => ({
//         recipient: user._id,
//         sender: author._id,
//         postId: newPost._id,
//         postModel: "AdminPost",
//         postContentSnippet: content ? content.trim() : "Uploaded media post.",
//         isRead: false,
//       }));

//       await Notification.insertMany(notifications);
//     }

//     return res.status(201).json({
//       success: true,
//       message: `Admin post published to ${postLanguage} students successfully.`,
//       data: newPost,
//     });
//   } catch (error) {
//     console.error("Error creating admin post:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server Error",
//       error: error.message,
//     });
//   }
// });

// app.post("/api/admin-posts", async (req, res) => {
//   const connection = await db.getConnection();

//   try {
//     const { userId, content, tagIds, fileLink, fileLinks, targetLanguage } =
//       req.body;

//     if (!userId) {
//       return res.status(400).json({
//         success: false,
//         message: "userId is required to create a post.",
//       });
//     }

//     const parsedUserId = parseInt(userId, 10);
//     if (isNaN(parsedUserId) || parsedUserId <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid userId format provided.",
//       });
//     }

//     // 1. Fetch Author (Admin)
//     let [authors] = await connection.execute(
//       "SELECT id, role, language, courseType FROM register WHERE id = ?",
//       [parsedUserId],
//     );

//     let author = authors.length > 0 ? authors[0] : null;

//     // Fallback: Find any admin user if specific userId is not found
//     if (!author) {
//       const [adminRows] = await connection.execute(
//         "SELECT id, role, language, courseType FROM register WHERE role = 'admin' LIMIT 1",
//       );
//       if (adminRows.length > 0) {
//         author = adminRows[0];
//       }
//     }

//     if (!author) {
//       return res.status(404).json({
//         success: false,
//         message: "Post author not found in database.",
//       });
//     }

//     // 2. Determine target language for the post
//     const postLanguage = targetLanguage || author.language || "English";

//     // Safely parse JSON strings sent from FormData/JSON payload
//     let parsedTagIds = [];
//     if (tagIds) {
//       try {
//         parsedTagIds = typeof tagIds === "string" ? JSON.parse(tagIds) : tagIds;
//       } catch (e) {
//         parsedTagIds = [];
//       }
//     }

//     // 3. Process incoming S3 file URLs
//     const rawLinks = fileLinks
//       ? Array.isArray(fileLinks)
//         ? fileLinks
//         : [fileLinks]
//       : fileLink
//         ? [fileLink]
//         : [];

//     const mediaFiles = rawLinks
//       .filter((link) => typeof link === "string" && link.trim() !== "")
//       .map((link) => ({
//         fileLink: link.trim(),
//         mediaType: getMediaTypeFromUrl(link),
//       }));

//     // Start transaction for atomic insertion
//     await connection.beginTransaction();

//     // 4. Save AdminPost with designated language and S3 media URLs
//     const insertAdminPostQuery = `
//       INSERT INTO adminposts
//         (userId, content, language, tagIds, courseType, mediaFiles)
//       VALUES (?, ?, ?, ?, ?, ?)
//     `;

//     const [postResult] = await connection.execute(insertAdminPostQuery, [
//       author.id,
//       content ? content.trim() : "",
//       postLanguage,
//       JSON.stringify(parsedTagIds),
//       author.courseType
//         ? JSON.stringify(author.courseType)
//         : JSON.stringify([]),
//       JSON.stringify(mediaFiles),
//     ]);

//     const newAdminPostId = postResult.insertId;

//     // 5. STRICT FILTER: Fetch recipients whose language matches postLanguage
//     const [targetUsers] = await connection.execute(
//       "SELECT id FROM register WHERE id != ? AND language = ?",
//       [author.id, postLanguage],
//     );

//     console.log(`Admin Post Created for Stream: ${postLanguage}`);
//     console.log(`Notifying ${targetUsers.length} ${postLanguage} students.`);

//     // 6. Send notifications to matching students
//     if (targetUsers.length > 0) {
//       const snippet = content ? content.trim() : "Uploaded media post.";

//       const notificationValues = targetUsers.map((user) => [
//         user.id, // recipientId
//         author.id, // senderId
//         "post", // type
//         null, // postId (NULL for AdminPost)
//         newAdminPostId, // adminPostId
//         null, // commentId
//         "AdminPost", // postModel
//         snippet, // postContentSnippet
//         false, // isRead
//       ]);

//       const insertNotificationsQuery = `
//         INSERT INTO notifications
//           (recipientId, senderId, type, postId, adminPostId, commentId, postModel, postContentSnippet, isRead)
//         VALUES ?
//       `;

//       await connection.query(insertNotificationsQuery, [notificationValues]);
//     }

//     // Commit transaction
//     await connection.commit();

//     const newPost = {
//       _id: newAdminPostId,
//       userId: author.id,
//       content: content ? content.trim() : "",
//       language: postLanguage,
//       tagIds: parsedTagIds,
//       courseType: author.courseType,
//       mediaFiles,
//       views: 0,
//       likes: [],
//       likeCount: 0,
//       createdAt: new Date(),
//       updatedAt: new Date(),
//     };

//     return res.status(201).json({
//       success: true,
//       message: `Admin post published to ${postLanguage} students successfully.`,
//       data: newPost,
//     });
//   } catch (error) {
//     await connection.rollback();
//     console.error("Error creating admin post:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server Error",
//       error: error.message,
//     });
//   } finally {
//     connection.release();
//   }
// });

// app.post("/api/admin-posts", async (req, res) => {
//   try {
//     const { userId, content, tagIds, fileLink, fileLinks, targetLanguage } =
//       req.body;

//     const parsedUserId = parseInt(userId, 10);
//     if (!parsedUserId || isNaN(parsedUserId) || parsedUserId <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Valid userId is required to create a post.",
//       });
//     }

//     // 1. Fetch Author (Admin)
//     let author = await User.findByPk(parsedUserId);
//     if (!author) {
//       author = await User.findOne({ where: { role: "admin" } });
//     }
//     if (!author) {
//       return res.status(404).json({
//         success: false,
//         message: "Post author not found in database.",
//       });
//     }

//     // 2. Determine target language for the post
//     const postLanguage = targetLanguage || author.language || "English";

//     // Safely parse JSON strings sent from FormData/JSON payload
//     let parsedTagIds = [];
//     if (tagIds) {
//       try {
//         parsedTagIds = typeof tagIds === "string" ? JSON.parse(tagIds) : tagIds;
//       } catch (e) {
//         parsedTagIds = [];
//       }
//     }

//     // 3. Process incoming S3 file URLs (supports single string or array)
//     const rawLinks = fileLinks
//       ? Array.isArray(fileLinks)
//         ? fileLinks
//         : [fileLinks]
//       : fileLink
//         ? [fileLink]
//         : [];

//     const mediaFiles = rawLinks
//       .filter((link) => typeof link === "string" && link.trim() !== "")
//       .map((link) => ({
//         fileLink: link.trim(),
//         mediaType: getMediaTypeFromUrl(link), // Assumes helper is defined in scope
//       }));

//     // Wrap post creation and notification dispatch in a transaction
//     const newPostData = await sequelize.transaction(async (t) => {
//       // 4. Save AdminPost with designated language and S3 media URLs
//       // Note: Assumes `tagIds` and `mediaFiles` are configured as JSON/JSONB columns in Sequelize
//       const newPost = await AdminPost.create(
//         {
//           userId: author.id,
//           content: content || "",
//           language: postLanguage,
//           tagIds: parsedTagIds,
//           courseType: author.courseType,
//           mediaFiles,
//         },
//         { transaction: t },
//       );

//       // 5. STRICT FILTER: Fetch recipients whose language matches postLanguage
//       const targetUsers = await User.findAll({
//         where: {
//           id: { [Op.ne]: author.id },
//           language: postLanguage,
//         },
//         attributes: ["id"],
//         transaction: t,
//       });

//       console.log(`Admin Post Created for Stream: ${postLanguage}`);
//       console.log(`Notifying ${targetUsers.length} ${postLanguage} students.`);

//       // 6. Send notifications to matching students
//       if (targetUsers.length > 0) {
//         const notificationsData = targetUsers.map((user) => ({
//           recipientId: user.id, // Mapped to Sequelize foreign key schema
//           senderId: author.id, // Mapped to Sequelize foreign key schema
//           postId: newPost.id,
//           postModel: "AdminPost",
//           postContentSnippet: content ? content.trim() : "Uploaded media post.",
//           isRead: false,
//         }));

//         await Notification.bulkCreate(notificationsData, { transaction: t });
//       }

//       return newPost;
//     });

//     const postData = newPostData.toJSON();

//     return res.status(201).json({
//       success: true,
//       message: `Admin post published to ${postLanguage} students successfully.`,
//       data: {
//         ...postData,
//         _id: postData.id, // Mongoose compatibility mapping
//       },
//     });
//   } catch (error) {
//     console.error("Error creating admin post:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server Error",
//       error: error.message,
//     });
//   }
// });

// ==========================================
// 1. CREATE ADMIN POST
// ==========================================
// app.post("/api/admin-posts", async (req, res) => {
//   try {
//     const {
//       userId,
//       content,
//       tagIds,
//       fileLink,
//       fileLinks,
//       targetLanguage,
//       language,
//     } = req.body;

//     const parsedUserId = parseInt(userId, 10);
//     if (!parsedUserId || isNaN(parsedUserId) || parsedUserId <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Valid userId is required to create a post.",
//       });
//     }

//     // Fetch author details
//     let author = await User.findByPk(parsedUserId);
//     if (!author) {
//       author = await User.findOne({ where: { role: "admin" } });
//     }
//     if (!author) {
//       return res.status(404).json({
//         success: false,
//         message: "Post author not found in database.",
//       });
//     }

//     // Normalize language (strictly scopes the post to this language)
//     const selectedLanguage =
//       targetLanguage || language || author.language || "English";

//     // Safely parse JSON strings
//     let parsedTagIds = [];
//     if (tagIds) {
//       try {
//         parsedTagIds = typeof tagIds === "string" ? JSON.parse(tagIds) : tagIds;
//       } catch (e) {
//         parsedTagIds = [];
//       }
//     }

//     // Process media links
//     const rawLinks = fileLinks
//       ? Array.isArray(fileLinks)
//         ? fileLinks
//         : [fileLinks]
//       : fileLink
//         ? [fileLink]
//         : [];

//     const mediaFiles = rawLinks
//       .filter((link) => typeof link === "string" && link.trim() !== "")
//       .map((link) => ({
//         fileLink: link.trim(),
//         mediaType: getMediaTypeFromUrl(link),
//       }));

//     // Perform database writes in a transaction
//     const newPostData = await sequelize.transaction(async (t) => {
//       // Create post explicitly tagged with the target language
//       const newPost = await AdminPost.create(
//         {
//           userId: author.id,
//           content: content || "",
//           language: selectedLanguage,
//           tagIds: parsedTagIds,
//           courseType: author.courseType,
//           mediaFiles,
//         },
//         { transaction: t },
//       );

//       // Notify ALL users set to this specific language (excluding the author)
//       const targetUsers = await User.findAll({
//         where: {
//           id: { [Op.ne]: author.id },
//           language: selectedLanguage,
//         },
//         attributes: ["id"],
//         transaction: t,
//       });

//       if (targetUsers.length > 0) {
//         const notificationsData = targetUsers.map((user) => ({
//           recipientId: user.id,
//           senderId: author.id,
//           postId: newPost.id,
//           postModel: "AdminPost",
//           postContentSnippet: content ? content.trim() : "Uploaded media post.",
//           language: selectedLanguage,
//           type: "post",
//           isRead: false,
//         }));

//         await Notification.bulkCreate(notificationsData, { transaction: t });
//       }

//       return newPost;
//     });

//     const postData = newPostData.toJSON();

//     return res.status(201).json({
//       success: true,
//       message: `Admin post published successfully to all ${selectedLanguage} users.`,
//       data: {
//         ...postData,
//         _id: postData.id,
//       },
//     });
//   } catch (error) {
//     console.error("Error creating admin post:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server Error",
//       error: error.message,
//     });
//   }
// });

// app.post("/api/admin-posts", async (req, res) => {
//   try {
//     const {
//       userId,
//       content,
//       tagIds,
//       fileLink,
//       fileLinks,
//       targetLanguage,
//       language,
//     } = req.body;

//     const parsedUserId = parseInt(userId, 10);
//     if (!parsedUserId || isNaN(parsedUserId) || parsedUserId <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Valid userId is required to create a post.",
//       });
//     }

//     // 1. Fetch author details from User table
//     let author = await User.findByPk(parsedUserId);
//     if (!author) {
//       author = await User.findOne({ where: { role: "admin" } });
//     }
//     if (!author) {
//       return res.status(404).json({
//         success: false,
//         message: "Post author not found in database.",
//       });
//     }

//     // 2. Normalize language selection
//     const selectedLanguage =
//       targetLanguage || language || author.language || "English";

//     // Safely parse JSON strings for tags
//     let parsedTagIds = [];
//     if (tagIds) {
//       try {
//         parsedTagIds = typeof tagIds === "string" ? JSON.parse(tagIds) : tagIds;
//       } catch (e) {
//         parsedTagIds = [];
//       }
//     }

//     // 3. Process media links
//     const rawLinks = fileLinks
//       ? Array.isArray(fileLinks)
//         ? fileLinks
//         : [fileLinks]
//       : fileLink
//         ? [fileLink]
//         : [];

//     const mediaFiles = rawLinks
//       .filter((link) => typeof link === "string" && link.trim() !== "")
//       .map((link) => ({
//         fileLink: link.trim(),
//         mediaType: getMediaTypeFromUrl(link),
//       }));

//     // 4. Perform database writes in an isolated transaction
//     const newPostData = await sequelize.transaction(async (t) => {
//       // Create admin post record
//       const newPost = await AdminPost.create(
//         {
//           userId: author.id,
//           content: content || "",
//           language: selectedLanguage,
//           tagIds: parsedTagIds,
//           courseType: author.courseType,
//           mediaFiles,
//         },
//         { transaction: t },
//       );

//       // 5. FETCH RECIPIENTS FROM THE REGISTER TABLE BY LANGUAGE
//       // Matches both exact case and lowercase variations (e.g. "Telugu", "telugu")
//       const registeredUsers = await Register.findAll({
//         where: {
//           [Op.or]: [
//             { language: selectedLanguage },
//             { language: selectedLanguage.toLowerCase() },
//           ],
//           userId: { [Op.ne]: author.id }, // Exclude post creator
//         },
//         attributes: ["userId", "id"], // Fetch userId / foreign key reference
//         raw: true,
//         transaction: t,
//       });

//       // Extract unique user IDs from registered records
//       const recipientIds = [
//         ...new Set(
//           registeredUsers
//             .map((u) => u.userId || u.id)
//             .filter((id) => id && id !== author.id),
//         ),
//       ];

//       console.log(
//         `Target language: "${selectedLanguage}". Found ${recipientIds.length} registered users.`,
//       );

//       // 6. Bulk insert notifications for all registered users in that language
//       if (recipientIds.length > 0) {
//         const notificationsData = recipientIds.map((recipientId) => ({
//           recipientId,
//           senderId: author.id,
//           postId: newPost.id,
//           postModel: "AdminPost",
//           postContentSnippet: content ? content.trim() : "Uploaded media post.",
//           language: selectedLanguage,
//           type: "post",
//           isRead: false,
//         }));

//         await Notification.bulkCreate(notificationsData, { transaction: t });
//       }

//       return newPost;
//     });

//     const postData = newPostData.toJSON();

//     return res.status(201).json({
//       success: true,
//       message: `Admin post published successfully to all registered ${selectedLanguage} users.`,
//       data: {
//         ...postData,
//         _id: postData.id,
//       },
//     });
//   } catch (error) {
//     console.error("Error creating admin post:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server Error",
//       error: error.message,
//     });
//   }
// });

// app.post("/api/admin-posts", async (req, res) => {
//   try {
//     const {
//       userId,
//       content,
//       tagIds,
//       fileLink,
//       fileLinks,
//       targetLanguage,
//       language,
//     } = req.body;

//     const parsedUserId = parseInt(userId, 10);
//     if (!parsedUserId || isNaN(parsedUserId) || parsedUserId <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Valid userId is required to create a post.",
//       });
//     }

//     // 1. Fetch author details
//     let author = await User.findByPk(parsedUserId);
//     if (!author) {
//       author = await User.findOne({ where: { role: "admin" } });
//     }
//     if (!author) {
//       return res.status(404).json({
//         success: false,
//         message: "Post author not found in database.",
//       });
//     }

//     // 2. Normalize target language selection
//     const selectedLanguage =
//       targetLanguage || language || author.language || "English";

//     // Safely parse JSON strings for tags
//     let parsedTagIds = [];
//     if (tagIds) {
//       try {
//         parsedTagIds = typeof tagIds === "string" ? JSON.parse(tagIds) : tagIds;
//       } catch (e) {
//         parsedTagIds = [];
//       }
//     }

//     // 3. Process media files
//     const rawLinks = fileLinks
//       ? Array.isArray(fileLinks)
//         ? fileLinks
//         : [fileLinks]
//       : fileLink
//         ? [fileLink]
//         : [];

//     const mediaFiles = rawLinks
//       .filter((link) => typeof link === "string" && link.trim() !== "")
//       .map((link) => ({
//         fileLink: link.trim(),
//         mediaType: getMediaTypeFromUrl(link),
//       }));

//     // 4. Perform database updates in a single transaction
//     const newPostData = await sequelize.transaction(async (t) => {
//       // Create admin post
//       const newPost = await AdminPost.create(
//         {
//           userId: author.id,
//           content: content || "",
//           language: selectedLanguage,
//           tagIds: parsedTagIds,
//           courseType: author.courseType,
//           mediaFiles,
//         },
//         { transaction: t },
//       );

//       // 5. Query ALL registered users in User table matching target language
//       const registeredUsers = await User.findAll({
//         where: {
//           [Op.or]: [
//             { language: selectedLanguage },
//             { language: selectedLanguage.toLowerCase() },
//           ],
//           id: { [Op.ne]: author.id }, // Exclude post author
//         },
//         attributes: ["id"],
//         raw: true,
//         transaction: t,
//       });

//       const recipientIds = registeredUsers.map((u) => u.id);

//       // 6. Bulk create notifications directly bound to target language
//       if (recipientIds.length > 0) {
//         const notificationsData = recipientIds.map((recipientId) => ({
//           recipientId,
//           senderId: author.id,
//           postId: newPost.id,
//           postModel: "AdminPost",
//           postContentSnippet: content ? content.trim() : "Uploaded media post.",
//           language: selectedLanguage,
//           type: "post",
//           isRead: false,
//         }));

//         await Notification.bulkCreate(notificationsData, { transaction: t });
//       }

//       return newPost;
//     });

//     const postData = newPostData.toJSON();

//     return res.status(201).json({
//       success: true,
//       message: `Admin post published successfully to all ${selectedLanguage} users.`,
//       data: {
//         ...postData,
//         _id: postData.id,
//       },
//     });
//   } catch (error) {
//     console.error("Error creating admin post:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server Error",
//       error: error.message,
//     });
//   }
// });

// ==========================================
// CREATE ADMIN POST & NOTIFY USERS
// ==========================================
// app.post("/api/admin-posts", async (req, res) => {
//   try {
//     const {
//       userId,
//       content,
//       tagIds,
//       fileLink,
//       fileLinks,
//       targetLanguage,
//       language,
//     } = req.body;
//     console.log("admin post language", language);

//     const parsedUserId = parseInt(userId, 10);
//     if (!parsedUserId || isNaN(parsedUserId) || parsedUserId <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Valid userId is required to create a post.",
//       });
//     }

//     // 1. Fetch author details
//     let author = await User.findByPk(parsedUserId);
//     if (!author) {
//       author = await User.findOne({ where: { role: "admin" } });
//     }
//     if (!author) {
//       return res.status(404).json({
//         success: false,
//         message: "Post author not found in database.",
//       });
//     }

//     // 2. Normalize target language selection (e.g. "Telugu" / "English")
//     let rawLang = language;
//     rawLang = rawLang.trim();

//     // Capitalize properly to keep data uniform (e.g., "telugu" -> "Telugu")
//     const selectedLanguage = rawLang;
//     console.log("selectedLanguage", selectedLanguage);

//     // Safely parse JSON strings for tags
//     let parsedTagIds = [];
//     if (tagIds) {
//       try {
//         parsedTagIds = typeof tagIds === "string" ? JSON.parse(tagIds) : tagIds;
//       } catch (e) {
//         parsedTagIds = [];
//       }
//     }

//     // 3. Process media files
//     const rawLinks = fileLinks
//       ? Array.isArray(fileLinks)
//         ? fileLinks
//         : [fileLinks]
//       : fileLink
//         ? [fileLink]
//         : [];

//     const mediaFiles = rawLinks
//       .filter((link) => typeof link === "string" && link.trim() !== "")
//       .map((link) => ({
//         fileLink: link.trim(),
//         mediaType: getMediaTypeFromUrl(link),
//       }));

//     // 4. Perform database updates in a single transaction
//     const newPostData = await sequelize.transaction(async (t) => {
//       // Create admin post
//       const newPost = await AdminPost.create(
//         {
//           userId: author.id,
//           content: content || "",
//           language: selectedLanguage,
//           tagIds: parsedTagIds,
//           courseType: author.courseType,
//           mediaFiles,
//         },
//         { transaction: t },
//       );

//       // 5. Query ALL registered users matching target language (Case-Insensitive)
//       const registeredUsers = await User.findAll({
//         where: {
//           [Op.and]: [
//             {
//               [Op.or]: [{ language: selectedLanguage }],
//             },
//             { id: { [Op.ne]: author.id } }, // Exclude post author
//           ],
//         },
//         attributes: ["id", "language"],
//         raw: true,
//         transaction: t,
//       });

//       console.log("registeredUsers", registeredUsers);

//       const recipientIds = registeredUsers.map((u) => u.id);
//       console.log("recipientIds", recipientIds);

//       // 6. Bulk create notifications for target language users
//       if (recipientIds.length > 0) {
//         const notificationsData = recipientIds.map((recipientId) => ({
//           recipientId,
//           senderId: author.id,
//           postId: newPost.id,
//           postModel: "AdminPost",
//           postContentSnippet: content ? content.trim() : "Uploaded media post.",
//           language: selectedLanguage,
//           type: "post",
//           isRead: false,
//         }));

//         await Notification.bulkCreate(notificationsData, { transaction: t });
//       }

//       return newPost;
//     });

//     const postData = newPostData.toJSON();

//     return res.status(201).json({
//       success: true,
//       message: `Admin post published successfully and notifications sent to ${selectedLanguage} users.`,
//       data: {
//         ...postData,
//         _id: postData.id,
//       },
//     });
//   } catch (error) {
//     console.error("Error creating admin post:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server Error",
//       error: error.message,
//     });
//   }
// });

app.post("/api/admin-posts", async (req, res) => {
  try {
    const {
      userId,
      content,
      tagIds,
      fileLink,
      fileLinks,
      targetLanguage,
      language,
    } = req.body;

    const parsedUserId = parseInt(userId, 10);
    if (!parsedUserId || isNaN(parsedUserId) || parsedUserId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid userId is required to create a post.",
      });
    }

    // 1. Fetch post author
    let author = await User.findByPk(parsedUserId);
    if (!author) {
      author = await User.findOne({ where: { role: "admin" } });
    }
    if (!author) {
      return res.status(404).json({
        success: false,
        message: "Post author not found in database.",
      });
    }

    // 2. Normalize selected language (e.g., "Telugu" / "English")
    let rawLang = targetLanguage || language || author.language || "English";
    rawLang = rawLang.trim();
    const selectedLanguage =
      rawLang.charAt(0).toUpperCase() + rawLang.slice(1).toLowerCase();

    // Safely parse JSON strings for tags
    let parsedTagIds = [];
    if (tagIds) {
      try {
        parsedTagIds = typeof tagIds === "string" ? JSON.parse(tagIds) : tagIds;
      } catch (e) {
        parsedTagIds = [];
      }
    }

    // 3. Process attached media
    const rawLinks = fileLinks
      ? Array.isArray(fileLinks)
        ? fileLinks
        : [fileLinks]
      : fileLink
        ? [fileLink]
        : [];

    const mediaFiles = rawLinks
      .filter((link) => typeof link === "string" && link.trim() !== "")
      .map((link) => ({
        fileLink: link.trim(),
        mediaType: getMediaTypeFromUrl(link),
      }));

    // 4. Create post and send notifications inside a single transaction
    const newPostData = await sequelize.transaction(async (t) => {
      const newPost = await AdminPost.create(
        {
          userId: author.id,
          content: content || "",
          language: selectedLanguage,
          tagIds: parsedTagIds,
          courseType: author.courseType,
          mediaFiles,
        },
        { transaction: t },
      );

      // 5. Query matching users in User table by language
      const registeredUsers = await User.findAll({
        where: {
          [Op.and]: [
            {
              [Op.or]: [
                { language: selectedLanguage },
                { language: selectedLanguage.toLowerCase() },
                { language: selectedLanguage.toUpperCase() },
              ],
            },
            { id: { [Op.ne]: author.id } }, // Exclude post author
          ],
        },
        attributes: ["id"],
        raw: true,
        transaction: t,
      });

      const recipientIds = registeredUsers.map((u) => u.id);

      // 6. Bulk create notifications (omitting 'language' property)
      if (recipientIds.length > 0) {
        const notificationsData = recipientIds.map((recipientId) => ({
          recipientId,
          senderId: author.id,
          postId: newPost.id,
          postModel: "AdminPost",
          postContentSnippet: content ? content.trim() : "Uploaded media post.",
          type: "post",
          isRead: false,
        }));

        await Notification.bulkCreate(notificationsData, { transaction: t });
      }

      return newPost;
    });

    const postData = newPostData.toJSON();

    return res.status(201).json({
      success: true,
      message: `Admin post published successfully and notifications sent to ${selectedLanguage} users.`,
      data: {
        ...postData,
        _id: postData.id,
      },
    });
  } catch (error) {
    console.error("Error creating admin post:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
});

// app.get("/api/admin-posts", async (req, res) => {
//   try {
//     const { language } = req.query;

//     let formattedLang;
//     if (language) {
//       const lower = language.toLowerCase();
//       if (lower === "te" || lower === "telugu") formattedLang = "Telugu";
//       if (lower === "en" || lower === "english") formattedLang = "English";
//     }

//     const posts = await AdminPost.aggregate([
//       // 1. Join Admin Post Author details safely
//       {
//         $lookup: {
//           from: "register",
//           let: { postUserId: "$userId" },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $eq: [{ $toString: "$_id" }, { $toString: "$$postUserId" }],
//                 },
//               },
//             },
//           ],
//           as: "authorDetails",
//         },
//       },
//       {
//         $unwind: {
//           path: "$authorDetails",
//           preserveNullAndEmptyArrays: true,
//         },
//       },

//       // 2. Filter posts by language match if query provided
//       ...(formattedLang
//         ? [
//             {
//               $match: {
//                 $or: [
//                   { language: formattedLang },
//                   { "authorDetails.language": formattedLang },
//                 ],
//               },
//             },
//           ]
//         : []),

//       // 3. Join Post Author's PersonalDetails by userId (Prefer post lang, fallback to any valid image)
//       {
//         $lookup: {
//           from: "personaldetails",
//           let: {
//             authorId: "$authorDetails._id",
//             postLang: { $ifNull: ["$language", "$authorDetails.language"] },
//           },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $eq: [{ $toString: "$userId" }, { $toString: "$$authorId" }],
//                 },
//               },
//             },
//             {
//               $addFields: {
//                 isLangMatch: {
//                   $cond: [{ $eq: ["$language", "$$postLang"] }, 1, 0],
//                 },
//                 hasImage: {
//                   $cond: [
//                     {
//                       $and: [
//                         { $ne: ["$profileImage", null] },
//                         { $ne: ["$profileImage", ""] },
//                       ],
//                     },
//                     1,
//                     0,
//                   ],
//                 },
//               },
//             },
//             { $sort: { isLangMatch: -1, hasImage: -1, createdAt: -1 } },
//           ],
//           as: "authorProfile",
//         },
//       },

//       // 4. Join admincomments and match commenter profile strictly by userId
//       {
//         $lookup: {
//           from: "admincomments",
//           let: {
//             postId: "$_id",
//             postLang: { $ifNull: ["$language", "$authorDetails.language"] },
//           },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $eq: [{ $toString: "$postId" }, { $toString: "$$postId" }],
//                 },
//               },
//             },
//             // Join Comment Author User
//             {
//               $lookup: {
//                 from: "register",
//                 let: { commentUserId: "$userId" },
//                 pipeline: [
//                   {
//                     $match: {
//                       $expr: {
//                         $eq: [
//                           { $toString: "$_id" },
//                           { $toString: "$$commentUserId" },
//                         ],
//                       },
//                     },
//                   },
//                 ],
//                 as: "commentAuthor",
//               },
//             },
//             {
//               $unwind: {
//                 path: "$commentAuthor",
//                 preserveNullAndEmptyArrays: true,
//               },
//             },
//             // Join Comment Author's PersonalDetails matching ONLY by userId
//             {
//               $lookup: {
//                 from: "personaldetails",
//                 let: {
//                   commentAuthorId: {
//                     $ifNull: ["$commentAuthor._id", "$userId"],
//                   },
//                   targetLang: "$$postLang",
//                 },
//                 pipeline: [
//                   {
//                     $match: {
//                       $expr: {
//                         $eq: [
//                           { $toString: "$userId" },
//                           { $toString: "$$commentAuthorId" },
//                         ],
//                       },
//                     },
//                   },
//                   {
//                     $addFields: {
//                       isLangMatch: {
//                         $cond: [{ $eq: ["$language", "$$targetLang"] }, 1, 0],
//                       },
//                       hasImage: {
//                         $cond: [
//                           {
//                             $and: [
//                               { $ne: ["$profileImage", null] },
//                               { $ne: ["$profileImage", ""] },
//                             ],
//                           },
//                           1,
//                           0,
//                         ],
//                       },
//                     },
//                   },
//                   { $sort: { isLangMatch: -1, hasImage: -1, createdAt: -1 } },
//                 ],
//                 as: "commentAuthorProfile",
//               },
//             },
//             // Format comment object with profile image fallback
//             {
//               $project: {
//                 _id: 1,
//                 content: 1,
//                 parentId: 1,
//                 createdAt: 1,
//                 userId: {
//                   _id: { $ifNull: ["$commentAuthor._id", "$userId"] },
//                   username: {
//                     $ifNull: ["$commentAuthor.username", "$username"],
//                   },
//                   profileImage: {
//                     $ifNull: [
//                       {
//                         $arrayElemAt: ["$commentAuthorProfile.profileImage", 0],
//                       },
//                       "",
//                     ],
//                   },
//                 },
//               },
//             },
//           ],
//           as: "rawComments",
//         },
//       },

//       // 5. Structure top-level comments and nest corresponding replies
//       {
//         $addFields: {
//           commentCount: { $size: "$rawComments" },
//           allComments: {
//             $map: {
//               input: {
//                 $filter: {
//                   input: "$rawComments",
//                   as: "c",
//                   cond: {
//                     $or: [
//                       { $eq: ["$$c.parentId", null] },
//                       { $eq: ["$$c.parentId", ""] },
//                       { $not: ["$$c.parentId"] },
//                     ],
//                   },
//                 },
//               },
//               as: "parent",
//               in: {
//                 _id: "$$parent._id",
//                 content: "$$parent.content",
//                 createdAt: "$$parent.createdAt",
//                 userId: "$$parent.userId",
//                 replies: {
//                   $filter: {
//                     input: "$rawComments",
//                     as: "reply",
//                     cond: {
//                       $eq: [
//                         { $toString: "$$reply.parentId" },
//                         { $toString: "$$parent._id" },
//                       ],
//                     },
//                   },
//                 },
//               },
//             },
//           },
//           userId: {
//             _id: "$authorDetails._id",
//             username: "$authorDetails.username",
//             mobile: "$authorDetails.mobile",
//             role: "$authorDetails.role",
//             courseType: "$authorDetails.courseType",
//             language: "$authorDetails.language",
//             profileImage: {
//               $ifNull: [
//                 { $arrayElemAt: ["$authorProfile.profileImage", 0] },
//                 "",
//               ],
//             },
//           },
//         },
//       },

//       // 6. Cleanup temp fields and sort
//       {
//         $project: {
//           rawComments: 0,
//           authorDetails: 0,
//           authorProfile: 0,
//         },
//       },
//       { $sort: { createdAt: -1 } },
//     ]);

//     return res.status(200).json({ success: true, data: posts });
//   } catch (error) {
//     return res.status(500).json({ success: false, message: error.message });
//   }
// });

// app.get("/api/admin-posts", async (req, res) => {
//   try {
//     const { language } = req.query;

//     let formattedLang;
//     if (language) {
//       const lower = language.toLowerCase();
//       if (lower === "te" || lower === "telugu") formattedLang = "Telugu";
//       if (lower === "en" || lower === "english") formattedLang = "English";
//     }

//     // 1. Fetch Admin Posts joined with Author (register) details
//     let postsQuery = `
//       SELECT
//         ap.id AS _id,
//         ap.userId,
//         ap.content,
//         ap.language,
//         ap.tagIds,
//         ap.courseType,
//         ap.mediaFiles,
//         ap.views,
//         ap.likes,
//         ap.likeCount,
//         ap.created_at AS createdAt,
//         ap.updated_at AS updatedAt,
//         r.id AS authorId,
//         r.username AS authorUsername,
//         r.mobile AS authorMobile,
//         r.role AS authorRole,
//         r.courseType AS authorCourseType,
//         r.language AS authorLanguage
//       FROM adminposts ap
//       LEFT JOIN register r ON ap.userId = r.id
//     `;

//     const queryParams = [];

//     if (formattedLang) {
//       postsQuery += ` WHERE ap.language = ? OR r.language = ?`;
//       queryParams.push(formattedLang, formattedLang);
//     }

//     postsQuery += ` ORDER BY ap.created_at DESC`;

//     const [postRows] = await db.execute(postsQuery, queryParams);

//     if (postRows.length === 0) {
//       return res.status(200).json({ success: true, data: [] });
//     }

//     const postIds = postRows.map((p) => p._id);
//     const authorIds = [
//       ...new Set(postRows.map((p) => p.userId).filter(Boolean)),
//     ];

//     // 2. Batch fetch Author Profile Images from personaldetails
//     let authorProfileMap = {};
//     if (authorIds.length > 0) {
//       const [profiles] = await db.query(
//         `SELECT userId, profileImage, language, created_at FROM personaldetails WHERE userId IN (?)`,
//         [authorIds],
//       );

//       // Rank profiles preferring post language and non-empty image
//       profiles.forEach((p) => {
//         if (
//           !authorProfileMap[p.userId] ||
//           (p.profileImage && p.profileImage.trim() !== "")
//         ) {
//           authorProfileMap[p.userId] = p.profileImage || "";
//         }
//       });
//     }

//     // 3. Batch fetch Comments & Comment Author details for these posts
//     const [commentRows] = await db.query(
//       `
//       SELECT
//         ac.id AS _id,
//         ac.postId,
//         ac.userId,
//         ac.content,
//         ac.parentId,
//         ac.created_at AS createdAt,
//         r.username AS commenterUsername,
//         pd.profileImage AS commenterProfileImage
//       FROM admincomments ac
//       LEFT JOIN register r ON ac.userId = r.id
//       LEFT JOIN personaldetails pd ON ac.userId = pd.userId
//       WHERE ac.postId IN (?)
//       ORDER BY ac.created_at ASC
//       `,
//       [postIds],
//     );

//     // Group comments by postId
//     const commentsByPostId = {};
//     commentRows.forEach((c) => {
//       if (!commentsByPostId[c.postId]) {
//         commentsByPostId[c.postId] = [];
//       }

//       commentsByPostId[c.postId].push({
//         _id: c._id,
//         content: c.content,
//         parentId: c.parentId || null,
//         createdAt: c.createdAt,
//         userId: {
//           _id: c.userId,
//           username: c.commenterUsername || "",
//           profileImage: c.commenterProfileImage || "",
//         },
//       });
//     });

//     // 4. Assemble final posts data structure with nested replies
//     const posts = postRows.map((post) => {
//       // Safely parse JSON strings if stored as JSON/TEXT in MySQL
//       let mediaFiles = post.mediaFiles;
//       let tagIds = post.tagIds;
//       let likes = post.likes;
//       let courseType = post.courseType;

//       if (typeof mediaFiles === "string")
//         mediaFiles = JSON.parse(mediaFiles || "[]");
//       if (typeof tagIds === "string") tagIds = JSON.parse(tagIds || "[]");
//       if (typeof likes === "string") likes = JSON.parse(likes || "[]");
//       if (typeof courseType === "string")
//         courseType = JSON.parse(courseType || "[]");

//       const rawComments = commentsByPostId[post._id] || [];

//       // Separate parent comments and nest replies
//       const parentComments = rawComments.filter((c) => !c.parentId);
//       const allComments = parentComments.map((parent) => ({
//         _id: parent._id,
//         content: parent.content,
//         createdAt: parent.createdAt,
//         userId: parent.userId,
//         replies: rawComments.filter(
//           (c) => String(c.parentId) === String(parent._id),
//         ),
//       }));

//       return {
//         _id: post._id,
//         content: post.content,
//         language: post.language,
//         tagIds,
//         courseType,
//         mediaFiles,
//         views: post.views || 0,
//         likes,
//         likeCount: post.likeCount || 0,
//         commentCount: rawComments.length,
//         allComments,
//         userId: {
//           _id: post.authorId,
//           username: post.authorUsername || "",
//           mobile: post.authorMobile || "",
//           role: post.authorRole || "",
//           courseType: post.authorCourseType || "",
//           language: post.authorLanguage || "",
//           profileImage: authorProfileMap[post.userId] || "",
//         },
//         createdAt: post.createdAt,
//         updatedAt: post.updatedAt,
//       };
//     });

//     return res.status(200).json({ success: true, data: posts });
//   } catch (error) {
//     console.error("Error fetching admin posts:", error);
//     return res.status(500).json({ success: false, message: error.message });
//   }
// });

// sql
// app.get("/api/admin-posts", async (req, res) => {
//   try {
//     const { language } = req.query;

//     let formattedLang;
//     if (language) {
//       const lower = language.toLowerCase();
//       if (lower === "te" || lower === "telugu") formattedLang = "Telugu";
//       if (lower === "en" || lower === "english") formattedLang = "English";
//     }

//     // Helper to safely parse JSON or fall back safely
//     const safeJsonParse = (val, fallback = []) => {
//       if (!val) return fallback;
//       if (typeof val !== "string") return val;
//       const trimmed = val.trim();
//       if (!trimmed.startsWith("[") && !trimmed.startsWith("{")) {
//         // Plain string value (e.g., "Face Yoga"), return as array/string contextually
//         return [trimmed];
//       }
//       try {
//         return JSON.parse(trimmed);
//       } catch {
//         return fallback;
//       }
//     };

//     // 1. Fetch Admin Posts joined with Author (register) details
//     let postsQuery = `
//       SELECT
//         ap.id AS _id,
//         ap.userId,
//         ap.content,
//         ap.language,
//         ap.tagIds,
//         ap.courseType,
//         ap.mediaFiles,
//         ap.views,
//         ap.likes,
//         ap.likeCount,
//         ap.created_at AS createdAt,
//         ap.updated_at AS updatedAt,
//         r.id AS authorId,
//         r.username AS authorUsername,
//         r.mobile AS authorMobile,
//         r.role AS authorRole,
//         r.courseType AS authorCourseType,
//         r.language AS authorLanguage
//       FROM adminposts ap
//       LEFT JOIN register r ON ap.userId = r.id
//     `;

//     const queryParams = [];

//     if (formattedLang) {
//       postsQuery += ` WHERE ap.language = ? OR r.language = ?`;
//       queryParams.push(formattedLang, formattedLang);
//     }

//     postsQuery += ` ORDER BY ap.created_at DESC`;

//     const [postRows] = await db.execute(postsQuery, queryParams);

//     if (postRows.length === 0) {
//       return res.status(200).json({ success: true, data: [] });
//     }

//     const postIds = postRows.map((p) => p._id);
//     const authorIds = [
//       ...new Set(postRows.map((p) => p.userId).filter(Boolean)),
//     ];

//     // 2. Batch fetch Author Profile Images from personaldetails
//     let authorProfileMap = {};
//     if (authorIds.length > 0) {
//       const [profiles] = await db.query(
//         `SELECT userId, profileImage, language, created_at FROM personaldetails WHERE userId IN (?)`,
//         [authorIds],
//       );

//       profiles.forEach((p) => {
//         if (
//           !authorProfileMap[p.userId] ||
//           (p.profileImage && p.profileImage.trim() !== "")
//         ) {
//           authorProfileMap[p.userId] = p.profileImage || "";
//         }
//       });
//     }

//     // 3. Batch fetch Comments & Comment Author details for these posts
//     const [commentRows] = await db.query(
//       `
//       SELECT
//         ac.id AS _id,
//         ac.postId,
//         ac.userId,
//         ac.content,
//         ac.parentId,
//         ac.created_at AS createdAt,
//         r.username AS commenterUsername,
//         pd.profileImage AS commenterProfileImage
//       FROM admincomments ac
//       LEFT JOIN register r ON ac.userId = r.id
//       LEFT JOIN personaldetails pd ON ac.userId = pd.userId
//       WHERE ac.postId IN (?)
//       ORDER BY ac.created_at ASC
//       `,
//       [postIds],
//     );

//     // Group comments by postId
//     const commentsByPostId = {};
//     commentRows.forEach((c) => {
//       if (!commentsByPostId[c.postId]) {
//         commentsByPostId[c.postId] = [];
//       }

//       commentsByPostId[c.postId].push({
//         _id: c._id,
//         content: c.content,
//         parentId: c.parentId || null,
//         createdAt: c.createdAt,
//         userId: {
//           _id: c.userId,
//           username: c.commenterUsername || "",
//           profileImage: c.commenterProfileImage || "",
//         },
//       });
//     });

//     // 4. Assemble final posts data structure with nested replies
//     const posts = postRows.map((post) => {
//       // Use safe JSON parsing for stored database values
//       const mediaFiles = safeJsonParse(post.mediaFiles, []);
//       const tagIds = safeJsonParse(post.tagIds, []);
//       const likes = safeJsonParse(post.likes, []);
//       const courseType = safeJsonParse(post.courseType, []);

//       const rawComments = commentsByPostId[post._id] || [];

//       // Separate parent comments and nest replies
//       const parentComments = rawComments.filter((c) => !c.parentId);
//       const allComments = parentComments.map((parent) => ({
//         _id: parent._id,
//         content: parent.content,
//         createdAt: parent.createdAt,
//         userId: parent.userId,
//         replies: rawComments.filter(
//           (c) => String(c.parentId) === String(parent._id),
//         ),
//       }));

//       return {
//         _id: post._id,
//         content: post.content,
//         language: post.language,
//         tagIds,
//         courseType,
//         mediaFiles,
//         views: post.views || 0,
//         likes,
//         likeCount: post.likeCount || 0,
//         commentCount: rawComments.length,
//         allComments,
//         userId: {
//           _id: post.authorId,
//           username: post.authorUsername || "",
//           mobile: post.authorMobile || "",
//           role: post.authorRole || "",
//           courseType: post.authorCourseType || "",
//           language: post.authorLanguage || "",
//           profileImage: authorProfileMap[post.userId] || "",
//         },
//         createdAt: post.createdAt,
//         updatedAt: post.updatedAt,
//       };
//     });

//     return res.status(200).json({ success: true, data: posts });
//   } catch (error) {
//     console.error("Error fetching admin posts:", error);
//     return res.status(500).json({ success: false, message: error.message });
//   }
// });

app.get("/api/admin-posts", async (req, res) => {
  try {
    const { language } = req.query;

    let formattedLang;
    if (language) {
      const lower = language.toLowerCase();
      if (lower === "te" || lower === "telugu") formattedLang = "Telugu";
      if (lower === "en" || lower === "english") formattedLang = "English";
    }

    // Build language filter for post or author matching
    const whereCondition = {};
    if (formattedLang) {
      whereCondition[Op.or] = [
        { language: formattedLang },
        { "$User.language$": formattedLang },
      ];
    }

    // 1. Fetch AdminPosts with Author details, Author's PersonalDetails, and Comments
    const posts = await AdminPost.findAll({
      where: whereCondition,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          attributes: [
            "id",
            "username",
            "mobile",
            "role",
            "courseType",
            "language",
          ],
          include: [
            {
              model: PersonalDetails,
              required: false,
              attributes: ["profileImage", "language"],
            },
          ],
        },
        {
          model: AdminComment,
          required: false,
          include: [
            {
              model: User,
              attributes: ["id", "username"],
              include: [
                {
                  model: PersonalDetails,
                  required: false,
                  attributes: ["profileImage", "language"],
                },
              ],
            },
          ],
        },
      ],
    });

    // 2. Format results to mirror Mongoose response shape
    const formattedPosts = posts.map((postInstance) => {
      const post = postInstance.toJSON();

      // Helper to safely parse double-stringified / escaped JSON arrays
      const parseJsonField = (fieldValue) => {
        if (!fieldValue) return [];
        if (Array.isArray(fieldValue)) return fieldValue;
        if (typeof fieldValue === "string") {
          try {
            const cleaned = fieldValue
              .replace(/\\"/g, '"')
              .replace(/^"|"$/g, "");
            const parsed = JSON.parse(cleaned);
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [];
          }
        }
        return [];
      };
      const postLang = post.language || post.User?.language || "English";

      // Match author profile image by target language or take fallback
      const authorProfiles = post.User?.PersonalDetails || [];
      const matchedAuthorProfile =
        authorProfiles.find((p) => p.language === postLang) ||
        authorProfiles[0];

      // Format author profile payload
      const formattedAuthor = {
        _id: post.User?.id || post.userId,
        username: post.User?.username || "",
        mobile: post.User?.mobile || "",
        role: post.User?.role || "",
        courseType: post.User?.courseType || "",
        language: post.User?.language || "",
        profileImage: matchedAuthorProfile?.profileImage || "",
      };

      // Process and structure comments into parents and nested replies
      const rawComments = post.AdminComments || [];
      const parentComments = [];
      const repliesMap = {};

      rawComments.forEach((comment) => {
        const commenterProfiles = comment.User?.PersonalDetails || [];
        const matchedCommenterProfile =
          commenterProfiles.find((p) => p.language === postLang) ||
          commenterProfiles[0];

        const formattedComment = {
          _id: comment.id,
          content: comment.content,
          parentId: comment.parentId,
          createdAt: comment.createdAt,
          userId: {
            _id: comment.User?.id || comment.userId,
            username: comment.User?.username || comment.username || "",
            profileImage: matchedCommenterProfile?.profileImage || "",
          },
        };

        if (!comment.parentId) {
          parentComments.push({ ...formattedComment, replies: [] });
        } else {
          const pId = String(comment.parentId);
          if (!repliesMap[pId]) repliesMap[pId] = [];
          repliesMap[pId].push(formattedComment);
        }
      });

      const structuredComments = parentComments.map((parent) => ({
        ...parent,
        replies: repliesMap[String(parent._id)] || [],
      }));

      // Return unified AdminPost object matching legacy aggregation response
      const { AdminComments, User: userDetails, ...cleanPost } = post;

      return {
        ...cleanPost,
        mediaFiles: parseJsonField(post.mediaFiles || []),
        _id: post.id,
        commentCount: rawComments.length,
        allComments: structuredComments,
        userId: formattedAuthor,
      };
    });

    return res.status(200).json({ success: true, data: formattedPosts });
  } catch (error) {
    console.error("Error fetching admin posts:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// app.get("/api/admin-posts/admin/:adminId", async (req, res) => {
//   try {
//     const { adminId } = req.params; // Fixed: Destructure adminId to match route path

//     if (!mongoose.Types.ObjectId.isValid(adminId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid admin ID format",
//       });
//     }

//     const posts = await AdminPost.aggregate([
//       // 1. Filter posts matching the specific adminId
//       {
//         $match: {
//           userId: new mongoose.Types.ObjectId(adminId),
//         },
//       },
//       // 2. Join comments from 'admincomments' collection using string equality
//       {
//         $lookup: {
//           from: "admincomments",
//           let: { postId: "$_id" },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $eq: [{ $toString: "$postId" }, { $toString: "$$postId" }],
//                 },
//               },
//             },
//           ],
//           as: "allComments",
//         },
//       },
//       // 3. Add comment count
//       {
//         $addFields: {
//           commentCount: { $size: "$allComments" },
//         },
//       },
//       // 4. Remove heavy raw comments array
//       {
//         $project: {
//           allComments: 0,
//         },
//       },
//       { $sort: { createdAt: -1 } },
//     ]);

//     return res.status(200).json({
//       success: true,
//       count: posts.length,
//       data: posts,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// });

// app.get("/api/admin-posts/admin/:adminId", async (req, res) => {
//   try {
//     const { adminId } = req.params; // Fixed: Destructure adminId to match route path

//     if (!mongoose.Types.ObjectId.isValid(adminId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid admin ID format",
//       });
//     }

//     const posts = await AdminPost.aggregate([
//       // 1. Filter posts matching the specific adminId
//       {
//         $match: {
//           userId: new mongoose.Types.ObjectId(adminId),
//         },
//       },
//       // 2. Join comments from 'admincomments' collection using string equality
//       {
//         $lookup: {
//           from: "admincomments",
//           let: { postId: "$_id" },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $eq: [{ $toString: "$postId" }, { $toString: "$$postId" }],
//                 },
//               },
//             },
//           ],
//           as: "allComments",
//         },
//       },
//       // 3. Add comment count
//       {
//         $addFields: {
//           commentCount: { $size: "$allComments" },
//         },
//       },
//       // 4. Remove heavy raw comments array
//       {
//         $project: {
//           allComments: 0,
//         },
//       },
//       { $sort: { createdAt: -1 } },
//     ]);

//     return res.status(200).json({
//       success: true,
//       count: posts.length,
//       data: posts,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// });

// app.get("/api/admin-posts/admin/:adminId", async (req, res) => {
//   try {
//     const { adminId } = req.params;

//     const parsedAdminId = parseInt(adminId, 10);
//     if (isNaN(parsedAdminId) || parsedAdminId <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid admin ID format",
//       });
//     }

//     const query = `
//       SELECT
//         ap.id AS _id,
//         ap.userId,
//         ap.content,
//         ap.language,
//         ap.tagIds,
//         ap.courseType,
//         ap.mediaFiles,
//         ap.views,
//         ap.likes,
//         ap.likeCount,
//         ap.created_at AS createdAt,
//         ap.updated_at AS updatedAt,
//         COUNT(ac.id) AS commentCount
//       FROM adminposts ap
//       LEFT JOIN admincomments ac ON ap.id = ac.postId
//       WHERE ap.userId = ?
//       GROUP BY ap.id
//       ORDER BY ap.created_at DESC
//     `;

//     const [rows] = await db.execute(query, [parsedAdminId]);

//     const posts = rows.map((post) => {
//       let mediaFiles = post.mediaFiles;
//       let tagIds = post.tagIds;
//       let likes = post.likes;
//       let courseType = post.courseType;

//       if (typeof mediaFiles === "string")
//         mediaFiles = JSON.parse(mediaFiles || "[]");
//       if (typeof tagIds === "string") tagIds = JSON.parse(tagIds || "[]");
//       if (typeof likes === "string") likes = JSON.parse(likes || "[]");
//       if (typeof courseType === "string")
//         courseType = JSON.parse(courseType || "[]");

//       return {
//         _id: post._id,
//         userId: post.userId,
//         content: post.content,
//         language: post.language,
//         tagIds,
//         courseType,
//         mediaFiles,
//         views: post.views || 0,
//         likes,
//         likeCount: post.likeCount || 0,
//         commentCount: Number(post.commentCount),
//         createdAt: post.createdAt,
//         updatedAt: post.updatedAt,
//       };
//     });

//     return res.status(200).json({
//       success: true,
//       count: posts.length,
//       data: posts,
//     });
//   } catch (error) {
//     console.error("Error fetching admin posts by adminId:", error);
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// });

app.get("/api/admin-posts/admin/:adminId", async (req, res) => {
  try {
    const { adminId } = req.params;

    const parsedAdminId = parseInt(adminId, 10);
    if (!parsedAdminId || isNaN(parsedAdminId) || parsedAdminId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid admin ID format",
      });
    }

    // Fetch posts matching the admin ID with total comment count aggregation
    const posts = await AdminPost.findAll({
      where: { userId: parsedAdminId },
      attributes: {
        include: [
          [
            sequelize.fn("COUNT", sequelize.col("AdminComments.id")),
            "commentCount",
          ],
        ],
      },
      include: [
        {
          model: AdminComment,
          attributes: [], // Exclude raw comment fields to prevent heavy payloads
        },
      ],
      group: ["AdminPost.id"],
      order: [["createdAt", "DESC"]],
    });

    // Map instances to plain JSON and format Mongoose-compatible _id
    const formattedPosts = posts.map((postInstance) => {
      const post = postInstance.toJSON();
      return {
        ...post,
        _id: post.id,
        commentCount: parseInt(post.commentCount || 0, 10),
      };
    });

    return res.status(200).json({
      success: true,
      count: formattedPosts.length,
      data: formattedPosts,
    });
  } catch (error) {
    console.error("Error fetching admin posts by adminId:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// app.patch("/api/admin-posts/:postId/view", async (req, res) => {
//   try {
//     const { postId } = req.params;

//     // Atomically increment view count by 1
//     const updatedPost = await AdminPost.findByIdAndUpdate(
//       postId,
//       { $inc: { views: 1 } },
//       // { new: true },
//       { returnDocument: "after" },
//     );

//     if (!updatedPost) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Post not found" });
//     }

//     return res.status(200).json({
//       success: true,
//       views: updatedPost.views,
//     });
//   } catch (error) {
//     return res.status(500).json({ success: false, message: error.message });
//   }
// });

// app.patch("/api/admin-posts/:postId/view", async (req, res) => {
//   try {
//     const { postId } = req.params;

//     const parsedPostId = parseInt(postId, 10);
//     if (!parsedPostId || isNaN(parsedPostId) || parsedPostId <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid post ID format",
//       });
//     }

//     // Atomically increment the views count column directly in the database
//     const [affectedRows, [updatedPost]] = await AdminPost.increment("views", {
//       by: 1,
//       where: { id: parsedPostId },
//       returning: true, // Returns the updated post instance (supported natively in PostgreSQL)
//     });

//     // Fallback handling for databases like MySQL/MariaDB that don't return updated instances automatically
//     if (!affectedRows) {
//       const post = await AdminPost.findByPk(parsedPostId);
//       if (!post) {
//         return res
//           .status(404)
//           .json({ success: false, message: "Post not found" });
//       }

//       await post.increment("views", { by: 1 });
//       await post.reload();

//       return res.status(200).json({
//         success: true,
//         views: post.views,
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       views: updatedPost.views,
//     });
//   } catch (error) {
//     console.error("Error incrementing post view count:", error);
//     return res.status(500).json({ success: false, message: error.message });
//   }
// });

app.patch("/api/admin-posts/:postId/view", async (req, res) => {
  try {
    const { postId } = req.params;

    const parsedPostId = parseInt(postId, 10);
    if (!parsedPostId || isNaN(parsedPostId) || parsedPostId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID format",
      });
    }

    // 1. Fetch the post first to ensure it exists
    const post = await AdminPost.findByPk(parsedPostId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // 2. Increment view count on the instance directly
    await post.increment("views", { by: 1 });

    // 3. Reload the instance to obtain the freshly updated views count
    await post.reload();

    return res.status(200).json({
      success: true,
      views: post.views,
    });
  } catch (error) {
    console.error("Error incrementing post view count:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ----------------------------------------------------
// Toggles likes for a post by a given user
// ----------------------------------------------------
// app.patch("/api/admin-posts/:postId/like", async (req, res) => {
//   try {
//     const { postId } = req.params;
//     const { userId } = req.body; // Logged-in user's ID

//     if (!userId) {
//       return res
//         .status(400)
//         .json({ success: false, message: "userId is required" });
//     }

//     const post = await AdminPost.findById(postId);
//     if (!post) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Post not found" });
//     }

//     // Check if the user has already liked this post
//     const hasLiked = post.likes.includes(userId);

//     let updatedPost;
//     if (hasLiked) {
//       // Remove user ID and decrement like count
//       updatedPost = await AdminPost.findByIdAndUpdate(
//         postId,
//         {
//           $pull: { likes: userId },
//           $inc: { likeCount: -1 },
//         },
//         // { new: true },
//         { returnDocument: "after" },
//       );
//     } else {
//       // Add user ID and increment like count
//       updatedPost = await AdminPost.findByIdAndUpdate(
//         postId,
//         {
//           $addToSet: { likes: userId },
//           $inc: { likeCount: 1 },
//         },
//         // { new: true },
//         { returnDocument: "after" },
//       );
//     }

//     return res.status(200).json({
//       success: true,
//       liked: !hasLiked,
//       likeCount: updatedPost.likeCount,
//       likes: updatedPost.likes,
//     });
//   } catch (error) {
//     return res.status(500).json({ success: false, message: error.message });
//   }
// });

app.patch("/api/admin-posts/:postId/like", async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;

    const parsedPostId = parseInt(postId, 10);
    const parsedUserId = parseInt(userId, 10);

    if (!parsedUserId || isNaN(parsedUserId) || parsedUserId <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Valid userId is required" });
    }

    if (!parsedPostId || isNaN(parsedPostId) || parsedPostId <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid postId format" });
    }

    const post = await AdminPost.findByPk(parsedPostId);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    // Ensure likes array is initialized (for JSON column type)
    let currentLikes = Array.isArray(post.likes) ? [...post.likes] : [];
    const hasLiked = currentLikes.includes(parsedUserId);

    if (hasLiked) {
      // Remove user ID from array and decrement likeCount
      currentLikes = currentLikes.filter((id) => id !== parsedUserId);
      await post.decrement("likeCount", { by: 1 });
    } else {
      // Add user ID to array and increment likeCount
      currentLikes.push(parsedUserId);
      await post.increment("likeCount", { by: 1 });
    }

    // Update the JSON likes column and persist changes
    post.likes = currentLikes;
    await post.save();
    await post.reload();

    return res.status(200).json({
      success: true,
      liked: !hasLiked,
      likeCount: post.likeCount,
      likes: post.likes,
    });
  } catch (error) {
    console.error("Error toggling post like:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// sql
app.put("/api/admin-posts/:id", async (req, res) => {
  try {
    const {
      userId,
      content,
      tagIds,
      fileLink,
      fileLinks,
      targetLanguage,
      language,
      removedMediaIds,
    } = req.body;

    const parsedPostId = parseInt(req.params.id, 10);
    const parsedUserId = parseInt(userId, 10);

    if (!parsedPostId || isNaN(parsedPostId) || parsedPostId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID format",
      });
    }

    if (!parsedUserId || isNaN(parsedUserId) || parsedUserId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid userId is required to edit a post",
      });
    }

    // 1. Fetch admin post to update
    const post = await AdminPost.findByPk(parsedPostId);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    // 2. Fetch editor user details
    const author = await User.findByPk(parsedUserId);
    if (!author) {
      return res.status(404).json({
        success: false,
        message: "User making the edit not found in database.",
      });
    }

    // 3. Authorization check
    const isOwner = post.userId === author.id;
    const isAdmin = author.role === "admin";

    if (!isOwner && !isAdmin) {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized action" });
    }

    // 4. Update text content & language preferences
    if (content !== undefined) post.content = content;

    const newLang = targetLanguage || language;
    if (newLang) {
      const lower = newLang.toLowerCase();
      if (lower === "te" || lower === "telugu") post.language = "Telugu";
      if (lower === "en" || lower === "english") post.language = "English";
    }

    if (tagIds !== undefined) {
      try {
        post.tagIds = typeof tagIds === "string" ? JSON.parse(tagIds) : tagIds;
      } catch (e) {
        post.tagIds = [];
      }
    }

    // 5. Remove specified media files from AWS S3 Bucket & JSON array
    let currentMediaFiles = Array.isArray(post.mediaFiles)
      ? [...post.mediaFiles]
      : [];

    if (removedMediaIds) {
      let idsToDelete = [];
      try {
        idsToDelete =
          typeof removedMediaIds === "string"
            ? JSON.parse(removedMediaIds)
            : removedMediaIds;
      } catch (e) {
        idsToDelete = Array.isArray(removedMediaIds)
          ? removedMediaIds
          : [removedMediaIds];
      }

      const formattedIds = idsToDelete.map((id) => String(id));

      const updatedMediaFiles = [];
      for (const file of currentMediaFiles) {
        // Compare against file ID or index-based ID key
        const fileIdentifier = String(file.id || file._id || file.fileLink);

        if (formattedIds.includes(fileIdentifier)) {
          const s3Key = getS3KeyFromUrl(file.fileLink); // Helper assumed in scope
          if (s3Key) {
            try {
              await s3.send(
                new DeleteObjectCommand({
                  Bucket: process.env.AWS_BUCKET_NAME,
                  Key: s3Key,
                }),
              );
              console.log(`Successfully deleted S3 key: ${s3Key}`);
            } catch (s3Err) {
              console.error(`Failed to delete S3 key (${s3Key}):`, s3Err);
            }
          }
        } else {
          updatedMediaFiles.push(file);
        }
      }

      currentMediaFiles = updatedMediaFiles;
    }

    // 6. Append new S3 media URLs if provided
    const rawLinks = fileLinks
      ? Array.isArray(fileLinks)
        ? fileLinks
        : [fileLinks]
      : fileLink
        ? [fileLink]
        : [];

    const newUploadedMedia = rawLinks
      .filter((link) => typeof link === "string" && link.trim() !== "")
      .map((link) => ({
        fileLink: link.trim(),
        mediaType: getMediaTypeFromUrl(link), // Helper assumed in scope
      }));

    if (newUploadedMedia.length > 0) {
      currentMediaFiles.push(...newUploadedMedia);
    }

    // Assign updated array back to JSON column and persist
    post.mediaFiles = currentMediaFiles;

    await post.save();

    const postData = post.toJSON();

    return res.status(200).json({
      success: true,
      message: "Admin post updated successfully",
      data: {
        ...postData,
        _id: postData.id, // Mongoose compatibility mapping
      },
    });
  } catch (error) {
    console.error("Error updating admin post:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
});

// sql
app.delete("/api/admin-posts/:id", async (req, res) => {
  try {
    const userId = req.query.userid || req.query.userId;
    const { id } = req.params;

    const parsedPostId = parseInt(id, 10);
    const parsedUserId = parseInt(userId, 10);

    if (!parsedPostId || isNaN(parsedPostId) || parsedPostId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID format",
      });
    }

    const post = await AdminPost.findByPk(parsedPostId);

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    // 1. Authorization check
    if (!parsedUserId || post.userId !== parsedUserId) {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized action" });
    }

    // 2. Delete attached media files from AWS S3
    if (Array.isArray(post.mediaFiles) && post.mediaFiles.length > 0) {
      for (const file of post.mediaFiles) {
        const fileUrl = file.fileLink || file.url || file.path;
        const s3Key = getS3KeyFromUrl(fileUrl); // Helper assumed in scope

        if (s3Key) {
          try {
            await s3.send(
              new DeleteObjectCommand({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: s3Key,
              }),
            );
            console.log(`Successfully deleted S3 key: ${s3Key}`);
          } catch (s3Err) {
            console.error(`Failed to delete S3 key (${s3Key}):`, s3Err);
          }
        }
      }
    }

    // 3. Cascade delete associated post record, comments & notifications inside a transaction
    await sequelize.transaction(async (t) => {
      await Promise.all([
        AdminPost.destroy({ where: { id: parsedPostId }, transaction: t }),
        Comment.destroy({ where: { postId: parsedPostId }, transaction: t }),
        Notification.destroy({
          where: { postId: parsedPostId },
          transaction: t,
        }),
      ]);
    });

    return res.status(200).json({
      success: true,
      message:
        "Admin post, S3 media, comments, and notifications deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting admin post:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// app.post("/api/admin-comments", async (req, res) => {
//   try {
//     const { postId, userId, content, parentId, username, language } = req.body;
//     console.log("admin post comments language ", language);

//     const parsedPostId = parseInt(postId, 10);
//     const parsedUserId = parseInt(userId, 10);
//     const parsedParentId = parentId ? parseInt(parentId, 10) : null;

//     if (
//       !parsedPostId ||
//       isNaN(parsedPostId) ||
//       !parsedUserId ||
//       isNaN(parsedUserId) ||
//       !content?.trim() ||
//       !username?.trim()
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "postId, userId, username, and content are required fields.",
//       });
//     }

//     // 1. Fetch parent AdminPost to verify existence
//     const adminPost = await AdminPost.findByPk(parsedPostId, { raw: true });
//     if (!adminPost) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Admin post not found." });
//     }

//     const postLanguage = language || "English";

//     // 2. Fetch commenter profile picture for current post language
//     const profile = await PersonalDetails.findOne({
//       where: {
//         userId: parsedUserId,
//         language: postLanguage,
//       },
//       raw: true,
//     });

//     // 3. Create admin comment and send notifications in a transaction
//     let newComment;
//     await sequelize.transaction(async (t) => {
//       newComment = await AdminComment.create(
//         {
//           postId: parsedPostId,
//           userId: parsedUserId,
//           username: username.trim(),
//           content: content.trim(),
//           parentId: parsedParentId,
//         },
//         { transaction: t },
//       );

//       // 4. Query target users matching language OR admin role (excluding commenter)
//       const targetUsers = await User.findAll({
//         where: {
//           id: { [Op.ne]: parsedUserId },
//           [Op.or]: [{ language: postLanguage }, { role: "admin" }],
//         },
//         attributes: ["id"],
//         raw: true,
//         transaction: t,
//       });

//       if (targetUsers.length > 0) {
//         const notifications = targetUsers.map((recipient) => ({
//           recipient: recipient.id,
//           sender: parsedUserId,
//           postId: adminPost.id,
//           postModel: "AdminPost",
//           commentId: newComment.id,
//           postContentSnippet: content.trim(),
//           type: "comment",
//           language: postLanguage,
//           isRead: false,
//         }));

//         await Notification.bulkCreate(notifications, { transaction: t });
//       }
//     });

//     const commentData = newComment.toJSON();

//     // 5. Return enriched comment
//     return res.status(201).json({
//       ...commentData,
//       _id: commentData.id, // Mongoose compatibility mapping
//       userId: {
//         _id: String(parsedUserId),
//         id: parsedUserId,
//         username: username.trim(),
//         profileImage: profile?.profileImage || "",
//       },
//     });
//   } catch (error) {
//     console.error("Error submitting comment:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Error submitting comment",
//       error: error.message,
//     });
//   }
// });

// app.post("/api/admin-comments", async (req, res) => {
//   try {
//     const { postId, userId, content, parentId, username, language } = req.body;
//     console.log("admin post comments language ", language);

//     const parsedPostId = parseInt(postId, 10);
//     const parsedUserId = parseInt(userId, 10);
//     const parsedParentId = parentId ? parseInt(parentId, 10) : null;

//     if (
//       !parsedPostId ||
//       isNaN(parsedPostId) ||
//       !parsedUserId ||
//       isNaN(parsedUserId) ||
//       !content?.trim() ||
//       !username?.trim()
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "postId, userId, username, and content are required fields.",
//       });
//     }

//     // 1. Fetch parent AdminPost to verify existence
//     const adminPost = await AdminPost.findByPk(parsedPostId, { raw: true });
//     if (!adminPost) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Admin post not found." });
//     }

//     const postLanguage = language || "English";

//     // 2. Fetch commenter profile picture for current post language
//     const profile = await PersonalDetails.findOne({
//       where: {
//         userId: parsedUserId,
//         language: postLanguage,
//       },
//       raw: true,
//     });

//     // 3. Create admin comment and send notifications in a transaction
//     let newComment;
//     await sequelize.transaction(async (t) => {
//       newComment = await AdminComment.create(
//         {
//           postId: parsedPostId,
//           userId: parsedUserId,
//           username: username.trim(),
//           content: content.trim(),
//           parentId: parsedParentId,
//         },
//         { transaction: t },
//       );

//       // 4. Query target users matching language OR admin role (excluding commenter)
//       const targetUsers = await User.findAll({
//         where: {
//           id: { [Op.ne]: parsedUserId },
//           [Op.or]: [
//             { language: postLanguage },
//             { language: postLanguage.toLowerCase() },
//             { role: "admin" },
//           ],
//         },
//         attributes: ["id"],
//         raw: true,
//         transaction: t,
//       });

//       if (targetUsers.length > 0) {
//         // Correct column mapping: recipientId & senderId; commentId set to null to satisfy fk_notifications_comment
//         const notifications = targetUsers.map((recipient) => ({
//           recipientId: recipient.id,
//           senderId: parsedUserId,
//           postId: adminPost.id,
//           postModel: "AdminPost",
//           commentId: null,
//           postContentSnippet: content.trim(),
//           type: "comment",
//           isRead: false,
//         }));

//         await Notification.bulkCreate(notifications, { transaction: t });
//       }
//     });

//     const commentData = newComment.toJSON();

//     // 5. Return enriched comment
//     return res.status(201).json({
//       ...commentData,
//       _id: commentData.id, // Mongoose compatibility mapping
//       userId: {
//         _id: String(parsedUserId),
//         id: parsedUserId,
//         username: username.trim(),
//         profileImage: profile?.profileImage || "",
//       },
//     });
//   } catch (error) {
//     console.error("Error submitting comment:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Error submitting comment",
//       error: error.message,
//     });
//   }
// });

// app.post("/api/admin-comments", async (req, res) => {
//   try {
//     const { postId, userId, content, parentId, username, language } = req.body;

//     const parsedPostId = parseInt(postId, 10);
//     const parsedUserId = parseInt(userId, 10);
//     const parsedParentId = parentId ? parseInt(parentId, 10) : null;

//     if (
//       !parsedPostId ||
//       isNaN(parsedPostId) ||
//       !parsedUserId ||
//       isNaN(parsedUserId) ||
//       !content?.trim() ||
//       !username?.trim()
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "postId, userId, username, and content are required fields.",
//       });
//     }

//     // 1. Verify target AdminPost exists
//     const adminPost = await AdminPost.findByPk(parsedPostId, { raw: true });
//     if (!adminPost) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Admin post not found." });
//     }

//     // Normalize target language string (e.g. "Telugu" / "English")
//     let rawLang = language || adminPost.language || "English";
//     rawLang = rawLang.trim();
//     const postLanguage =
//       rawLang.charAt(0).toUpperCase() + rawLang.slice(1).toLowerCase();

//     // 2. Fetch commenter profile picture for current post language
//     const profile = await PersonalDetails.findOne({
//       where: {
//         userId: parsedUserId,
//         language: postLanguage,
//       },
//       raw: true,
//     });

//     // 3. Create admin comment and send notifications within transaction
//     let newComment;
//     await sequelize.transaction(async (t) => {
//       newComment = await AdminComment.create(
//         {
//           postId: parsedPostId,
//           userId: parsedUserId,
//           username: username.trim(),
//           content: content.trim(),
//           parentId: parsedParentId,
//         },
//         { transaction: t },
//       );

//       // 4. Query target users matching post language OR admin role (excluding commenter)
//       const targetUsers = await User.findAll({
//         where: {
//           id: { [Op.ne]: parsedUserId }, // Exclude commenter
//           [Op.or]: [
//             { language: postLanguage },
//             { language: postLanguage.toLowerCase() },
//             { language: postLanguage.toUpperCase() },
//             sequelize.where(
//               sequelize.fn(
//                 "LOWER",
//                 sequelize.fn("TRIM", sequelize.col("role")),
//               ),
//               "admin",
//             ),
//           ],
//         },
//         attributes: ["id"],
//         raw: true,
//         transaction: t,
//       });

//       // 5. Bulk create notifications including the generated commentId
//       if (targetUsers.length > 0) {
//         const notifications = targetUsers.map((recipient) => ({
//           recipientId: recipient.id,
//           senderId: parsedUserId,
//           postId: adminPost.id,
//           postModel: "AdminPost",
//           commentId: newComment.id, // Binds newly created AdminComment ID
//           postContentSnippet: content.trim(),
//           type: "comment",
//           isRead: false,
//         }));

//         await Notification.bulkCreate(notifications, { transaction: t });
//       }
//     });

//     const commentData = newComment.toJSON();

//     return res.status(201).json({
//       ...commentData,
//       _id: commentData.id,
//       userId: {
//         _id: String(parsedUserId),
//         id: parsedUserId,
//         username: username.trim(),
//         profileImage: profile?.profileImage || "",
//       },
//     });
//   } catch (error) {
//     console.error("Error submitting admin comment:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Error submitting comment",
//       error: error.message,
//     });
//   }
// });

// app.post("/api/admin-comments", async (req, res) => {
//   try {
//     const { postId, userId, content, parentId, username, language } = req.body;
//     console.log("language", language);

//     const parsedPostId = parseInt(postId, 10);
//     const parsedUserId = parseInt(userId, 10);
//     const parsedParentId = parentId ? parseInt(parentId, 10) : null;

//     if (
//       !parsedPostId ||
//       isNaN(parsedPostId) ||
//       !parsedUserId ||
//       isNaN(parsedUserId) ||
//       !content?.trim() ||
//       !username?.trim()
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "postId, userId, username, and content are required fields.",
//       });
//     }

//     // 1. Verify target AdminPost exists
//     const adminPost = await AdminPost.findByPk(parsedPostId, { raw: true });
//     if (!adminPost) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Admin post not found." });
//     }

//     // Determine target language standard format (English/Telugu) and shortcodes (en/te)
//     let inputLang = (language || adminPost.language || "English")
//       .trim()
//       .toLowerCase();
//     let langFull =
//       inputLang === "telugu" || inputLang === "te" ? "Telugu" : "English";
//     let langCode = langFull === "Telugu" ? "te" : "en";

//     // 2. Fetch commenter profile image
//     const profile = await PersonalDetails.findOne({
//       where: {
//         userId: parsedUserId,
//         language: langFull,
//       },
//       raw: true,
//     });

//     // 3. Create admin comment and trigger notifications within a transaction
//     let newComment;
//     await sequelize.transaction(async (t) => {
//       newComment = await AdminComment.create(
//         {
//           postId: parsedPostId,
//           userId: parsedUserId,
//           username: username.trim(),
//           content: content.trim(),
//           parentId: parsedParentId,
//         },
//         { transaction: t },
//       );

//       // 4. Query target recipients:
//       // - Exclude the commenter
//       // - Include matching language streams (case-insensitive & shortcodes) OR any admin
//       const targetUsers = await User.findAll({
//         where: {
//           id: { [Op.ne]: parsedUserId },
//           [Op.or]: [
//             // Matches admins regardless of their language selection
//             { role: { [Op.iLike]: "admin" } },
//             // Matches users matching target language stream or shortcode
//             { language: { [Op.iLike]: langFull } },
//             { language: { [Op.iLike]: langCode } },
//           ],
//         },
//         attributes: ["id"],
//         raw: true,
//         transaction: t,
//       });

//       // 5. Bulk create notifications for recipient list
//       if (targetUsers.length > 0) {
//         const notifications = targetUsers.map((recipient) => ({
//           recipientId: recipient.id,
//           senderId: parsedUserId,
//           postId: adminPost.id,
//           postModel: "AdminPost",
//           commentId: newComment.id,
//           postContentSnippet: content.trim(),
//           type: "comment",
//           isRead: false,
//         }));

//         await Notification.bulkCreate(notifications, { transaction: t });
//       }
//     });

//     const commentData = newComment.toJSON();

//     return res.status(201).json({
//       ...commentData,
//       _id: commentData.id,
//       userId: {
//         _id: String(parsedUserId),
//         id: parsedUserId,
//         username: username.trim(),
//         profileImage: profile?.profileImage || "",
//       },
//     });
//   } catch (error) {
//     console.error("Error submitting admin comment:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Error submitting comment",
//       error: error.message,
//     });
//   }
// });

app.post("/api/admin-comments", async (req, res) => {
  try {
    const { postId, userId, content, parentId, username, language } = req.body;

    const parsedPostId = parseInt(postId, 10);
    const parsedUserId = parseInt(userId, 10);
    const parsedParentId = parentId ? parseInt(parentId, 10) : null;

    if (
      !parsedPostId ||
      isNaN(parsedPostId) ||
      !parsedUserId ||
      isNaN(parsedUserId) ||
      !content?.trim() ||
      !username?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "postId, userId, username, and content are required fields.",
      });
    }

    // 1. Verify target AdminPost exists
    const adminPost = await AdminPost.findByPk(parsedPostId, { raw: true });
    if (!adminPost) {
      return res
        .status(404)
        .json({ success: false, message: "Admin post not found." });
    }

    // Determine target language standard format (English/Telugu) and code variants
    let inputLang = (language || adminPost.language || "English")
      .trim()
      .toLowerCase();
    let isTelugu = inputLang === "telugu" || inputLang === "te";
    let langVariations = isTelugu
      ? ["Telugu", "telugu", "TELUGU", "te", "TE"]
      : ["English", "english", "ENGLISH", "en", "EN"];

    // 2. Fetch commenter profile picture
    const profile = await PersonalDetails.findOne({
      where: {
        userId: parsedUserId,
        language: isTelugu ? "Telugu" : "English",
      },
      raw: true,
    });

    // 3. Create admin comment and send notifications in a transaction
    let newComment;
    await sequelize.transaction(async (t) => {
      newComment = await AdminComment.create(
        {
          postId: parsedPostId,
          userId: parsedUserId,
          username: username.trim(),
          content: content.trim(),
          parentId: parsedParentId,
        },
        { transaction: t },
      );

      // 4. Query target users using MySQL/MariaDB valid syntax (Op.in & Op.like)
      const targetUsers = await User.findAll({
        where: {
          id: { [Op.ne]: parsedUserId }, // Exclude commenter
          [Op.or]: [
            { role: { [Op.in]: ["admin", "ADMIN", "Admin"] } },
            { language: { [Op.in]: langVariations } },
          ],
        },
        attributes: ["id"],
        raw: true,
        transaction: t,
      });

      // 5. Bulk create notifications including the commentId
      if (targetUsers.length > 0) {
        const notifications = targetUsers.map((recipient) => ({
          recipientId: recipient.id,
          senderId: parsedUserId,
          postId: adminPost.id,
          postModel: "AdminPost",
          commentId: newComment.id,
          postContentSnippet: content.trim(),
          type: "comment",
          isRead: false,
        }));
        console.log("notifications", notifications);

        await Notification.bulkCreate(notifications, { transaction: t });
      }
    });

    const commentData = newComment.toJSON();

    return res.status(201).json({
      ...commentData,
      _id: commentData.id,
      userId: {
        _id: String(parsedUserId),
        id: parsedUserId,
        username: username.trim(),
        profileImage: profile?.profileImage || "",
      },
    });
  } catch (error) {
    console.error("Error submitting admin comment:", error);
    return res.status(500).json({
      success: false,
      message: "Error submitting comment",
      error: error.message,
    });
  }
});

// GET /api/admin-comments/post/:postId
app.get("/api/admin-comments/post/:postId", async (req, res) => {
  try {
    const { postId } = req.params;

    // Populate userId to attach username, role, etc.
    const postComments = await AdminComment.find({ postId })
      .populate("userId", "username mobile role language")
      .sort({ createdAt: 1 })
      .lean();

    const parentComments = [];
    const repliesMap = {};

    postComments.forEach((c) => {
      if (!c.parentId) {
        parentComments.push({ ...c, replies: [] });
      } else {
        const pId = c.parentId.toString();
        if (!repliesMap[pId]) repliesMap[pId] = [];
        repliesMap[pId].push(c);
      }
    });

    // Nest replies into corresponding parent items
    const structuredComments = parentComments.map((parent) => ({
      ...parent,
      replies: repliesMap[parent._id.toString()] || [],
    }));
    // .reverse();

    return res.status(200).json({
      success: true,
      totalCount: postComments.length,
      comments: structuredComments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching comments",
      error: error.message,
    });
  }
});

// GET: Filter support team members by language
// app.get("/api/support-team", async (req, res) => {
//   try {
//     const { language } = req.query;
//     const formattedLang = language;

//     const filter = {};
//     if (formattedLang) {
//       filter.language = formattedLang;
//     }

//     const members = await SupportTeam.find(filter).sort({ createdAt: -1 });
//     return res
//       .status(200)
//       .json({ success: true, count: members.length, data: members });
//   } catch (error) {
//     return res.status(500).json({ success: false, message: error.message });
//   }
// });

// // POST: Create a new support team member with language
// app.post("/api/support-team", async (req, res) => {
//   try {
//     const { name, role, avatar, phone, email, available, language } = req.body;
//     const formattedLang = language;

//     if (!name || !role || !phone || !email || !formattedLang) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Required fields missing, including language ('English' or 'Telugu').",
//       });
//     }

//     const newMember = await SupportTeam.create({
//       name,
//       role,
//       avatar,
//       phone,
//       email,
//       available,
//       language: formattedLang,
//     });

//     return res.status(201).json({ success: true, data: newMember });
//   } catch (error) {
//     return res.status(500).json({ success: false, message: error.message });
//   }
// });

// // PUT: Update support team member
// app.put("/api/support-team/:id", async (req, res) => {
//   try {
//     const updateData = { ...req.body };
//     if (updateData.language) {
//       updateData.language = updateData.language;
//     }

//     const updatedMember = await SupportTeam.findByIdAndUpdate(
//       req.params.id,
//       { $set: updateData },
//       { new: true, runValidators: true },
//     );

//     if (!updatedMember) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Member not found." });
//     }

//     return res.status(200).json({ success: true, data: updatedMember });
//   } catch (error) {
//     return res.status(500).json({ success: false, message: error.message });
//   }
// });

// // DELETE: Remove support team member
// app.delete("/api/support-team/:id", async (req, res) => {
//   try {
//     const deletedMember = await SupportTeam.findByIdAndDelete(req.params.id);
//     if (!deletedMember) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Member not found." });
//     }
//     return res
//       .status(200)
//       .json({ success: true, message: "Member deleted successfully." });
//   } catch (error) {
//     return res.status(500).json({ success: false, message: error.message });
//   }
// });

// GET: Fetch support team members with optional language filter
// app.get("/api/support-team", async (req, res) => {
//   try {
//     const { language } = req.query;

//     const whereClause = {};
//     if (language) {
//       whereClause.language = language;
//     }

//     // Replaces SupportTeam.find(filter).sort({ createdAt: -1 })
//     const members = await SupportTeam.findAll({
//       where: whereClause,
//       order: [["createdAt", "DESC"]],
//     });

//     return res
//       .status(200)
//       .json({ success: true, count: members.length, data: members });
//   } catch (error) {
//     console.error("Error fetching support team:", error);
//     return res.status(500).json({ success: false, message: error.message });
//   }
// });

// // POST: Create a new support team member
// app.post("/api/support-team", async (req, res) => {
//   try {
//     const { name, role, avatar, phone, email, available, language } = req.body;

//     if (!name || !role || !phone || !email || !language) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Required fields missing, including language ('English' or 'Telugu').",
//       });
//     }

//     // Replaces SupportTeam.create(...)
//     const newMember = await SupportTeam.create({
//       name,
//       role,
//       avatar,
//       phone,
//       email,
//       available,
//       language,
//     });

//     return res.status(201).json({ success: true, data: newMember });
//   } catch (error) {
//     console.error("Error creating support team member:", error);
//     return res.status(500).json({ success: false, message: error.message });
//   }
// });

// // PUT: Update support team member
// app.put("/api/support-team/:id", async (req, res) => {
//   try {
//     const memberId = parseInt(req.params.id, 10);
//     if (isNaN(memberId) || memberId <= 0) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Invalid member ID." });
//     }

//     // Replaces SupportTeam.findByIdAndUpdate(...)
//     const member = await SupportTeam.findByPk(memberId);
//     if (!member) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Member not found." });
//     }

//     const updatedMember = await member.update(req.body);

//     return res.status(200).json({ success: true, data: updatedMember });
//   } catch (error) {
//     console.error("Error updating support team member:", error);
//     return res.status(500).json({ success: false, message: error.message });
//   }
// });

// // DELETE: Remove support team member
// app.delete("/api/support-team/:id", async (req, res) => {
//   try {
//     const memberId = parseInt(req.params.id, 10);
//     if (isNaN(memberId) || memberId <= 0) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Invalid member ID." });
//     }

//     // Replaces SupportTeam.findByIdAndDelete(...)
//     const member = await SupportTeam.findByPk(memberId);
//     if (!member) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Member not found." });
//     }

//     await member.destroy();

//     return res
//       .status(200)
//       .json({ success: true, message: "Member deleted successfully." });
//   } catch (error) {
//     console.error("Error deleting support team member:", error);
//     return res.status(500).json({ success: false, message: error.message });
//   }
// });

// GET: Fetch support team members with optional language filter
app.get("/api/support-team", async (req, res) => {
  try {
    const { language } = req.query;

    const whereClause = {};

    if (language) {
      const lower = language.toLowerCase();
      if (lower === "telugu" || lower === "te") whereClause.language = "Telugu";
      else if (lower === "english" || lower === "en")
        whereClause.language = "English";
      else whereClause.language = language;
    }

    const members = await SupportTeam.findAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    return res
      .status(200)
      .json({ success: true, count: members.length, data: members });
  } catch (error) {
    console.error("Error fetching support team:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST: Create a new support team member
app.post("/api/support-team", async (req, res) => {
  try {
    const { name, role, avatar, phone, email, available, language } = req.body;

    if (!name || !role || !phone || !email || !language) {
      return res.status(400).json({
        success: false,
        message:
          "Required fields missing, including language ('English' or 'Telugu').",
      });
    }

    let formattedLang = language;
    const lower = language.toLowerCase();
    if (lower === "telugu" || lower === "te") formattedLang = "Telugu";
    if (lower === "english" || lower === "en") formattedLang = "English";

    const newMember = await SupportTeam.create({
      name,
      role,
      avatar: avatar || null,
      phone,
      email,
      available: available !== undefined ? available : true,
      language: formattedLang,
    });

    return res.status(201).json({ success: true, data: newMember });
  } catch (error) {
    console.error("Error creating support team member:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// PUT: Update support team member
app.put("/api/support-team/:id", async (req, res) => {
  try {
    const memberId = parseInt(req.params.id, 10);
    if (isNaN(memberId) || memberId <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid member ID." });
    }

    const member = await SupportTeam.findByPk(memberId);
    if (!member) {
      return res
        .status(404)
        .json({ success: false, message: "Member not found." });
    }

    const updateData = { ...req.body };

    if (updateData.language) {
      const lower = updateData.language.toLowerCase();
      if (lower === "telugu" || lower === "te") updateData.language = "Telugu";
      if (lower === "english" || lower === "en")
        updateData.language = "English";
    }

    const updatedMember = await member.update(updateData);

    return res.status(200).json({ success: true, data: updatedMember });
  } catch (error) {
    console.error("Error updating support team member:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE: Remove support team member
app.delete("/api/support-team/:id", async (req, res) => {
  try {
    const memberId = parseInt(req.params.id, 10);
    if (isNaN(memberId) || memberId <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid member ID." });
    }

    const member = await SupportTeam.findByPk(memberId);
    if (!member) {
      return res
        .status(404)
        .json({ success: false, message: "Member not found." });
    }

    await member.destroy();

    return res
      .status(200)
      .json({ success: true, message: "Member deleted successfully." });
  } catch (error) {
    console.error("Error deleting support team member:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// app.get("/api/personal-details/:userId", async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const { language } = req.query;

//     // 1. Validate integer userId format
//     const parsedUserId = parseInt(userId, 10);
//     if (isNaN(parsedUserId) || parsedUserId <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid user ID format",
//       });
//     }

//     // 2. Build dynamic SQL query based on presence of language query param
//     let query = "SELECT * FROM personaldetails WHERE userId = ?";
//     const queryParams = [parsedUserId];

//     if (language) {
//       query += " AND language = ?";
//       queryParams.push(language);
//     }

//     // Limit to 1 row to mimic Mongoose findOne()
//     query += " LIMIT 1";

//     const [rows] = await db.execute(query, queryParams);

//     // 3. Return object if found, otherwise null
//     const details = rows.length > 0 ? rows[0] : null;

//     // Map database column names to match MongoDB field naming if applicable
//     if (details) {
//       details._id = details.id;
//       details.createdAt = details.created_at;
//       details.updatedAt = details.updated_at;
//     }

//     return res.status(200).json({
//       success: true,
//       data: details,
//     });
//   } catch (error) {
//     console.error("Error fetching personal details:", error);
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// });

// sql
app.get("/api/personal-details/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { language } = req.query;

    // 1. Validate integer userId format
    const parsedUserId = parseInt(userId, 10);
    if (isNaN(parsedUserId) || parsedUserId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }

    // 2. Build where clause dynamically
    const whereClause = { userId: parsedUserId };
    if (language) {
      whereClause.language = language;
    }

    // 3. Query database using Sequelize Model
    const personalDetailInstance = await PersonalDetails.findOne({
      where: whereClause,
    });

    if (!personalDetailInstance) {
      return res.status(200).json({
        success: true,
        data: null,
      });
    }

    const details = personalDetailInstance.toJSON();

    // Map database column names for frontend compatibility
    details._id = details.id;

    return res.status(200).json({
      success: true,
      data: details,
    });
  } catch (error) {
    console.error("Error fetching personal details:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// app.put("/api/personal-details/:userId", async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const { name, aboutYou, gender, birthday, language } = req.body;

//     const parsedUserId = parseInt(userId, 10);
//     if (isNaN(parsedUserId) || parsedUserId <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid user ID format",
//       });
//     }

//     const formattedLang = language || "";

//     // 1. Perform UPSERT on personaldetails using ON DUPLICATE KEY UPDATE
//     const upsertDetailsQuery = `
//       INSERT INTO personaldetails (userId, name, aboutYou, gender, birthday, language)
//       VALUES (?, ?, ?, ?, ?, ?)
//       ON DUPLICATE KEY UPDATE
//         name = VALUES(name),
//         aboutYou = VALUES(aboutYou),
//         gender = VALUES(gender),
//         birthday = VALUES(birthday),
//         updated_at = CURRENT_TIMESTAMP
//     `;

//     await db.execute(upsertDetailsQuery, [
//       parsedUserId,
//       name || null,
//       aboutYou || null,
//       gender || null,
//       birthday || null,
//       formattedLang,
//     ]);

//     // 2. Sync updated name to the register (User) table if provided
//     if (name) {
//       await db.execute(`UPDATE register SET username = ? WHERE id = ?`, [
//         name,
//         parsedUserId,
//       ]);
//     }

//     // 3. Fetch updated record to return in response
//     const [rows] = await db.execute(
//       `SELECT * FROM personaldetails WHERE userId = ? AND language = ?`,
//       [parsedUserId, formattedLang],
//     );

//     return res.status(200).json({
//       success: true,
//       message: "Personal details updated successfully",
//       data: rows[0] || null,
//     });
//   } catch (error) {
//     console.error("Error updating personal details:", error);
//     return res.status(500).json({ success: false, message: error.message });
//   }
// });

// app.put("/api/personal-details/:userId", async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const { name, aboutYou, gender, birthday, language } = req.body;

//     const parsedUserId = parseInt(userId, 10);
//     if (isNaN(parsedUserId) || parsedUserId <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid user ID format",
//       });
//     }

//     const formattedLang = language || "";

//     // 1. Perform UPSERT using Sequelize
//     // Note: Ensures 'userId' and 'language' have a composite UNIQUE constraint on the table
//     await PersonalDetails.upsert({
//       userId: parsedUserId,
//       name: name || null,
//       aboutYou: aboutYou || null,
//       gender: gender || null,
//       birthday: birthday || null,
//       language: formattedLang,
//     });

//     // 2. Sync updated name to the User (register) model if provided
//     if (name) {
//       await User.update({ username: name }, { where: { id: parsedUserId } });
//     }

//     // 3. Fetch the updated record
//     const updatedDetails = await PersonalDetails.findOne({
//       where: {
//         userId: parsedUserId,
//         language: formattedLang,
//       },
//     });

//     const data = updatedDetails ? updatedDetails.toJSON() : null;
//     if (data) {
//       data._id = data.id; // Map id for frontend compatibility if needed
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Personal details updated successfully",
//       data,
//     });
//   } catch (error) {
//     console.error("Error updating personal details:", error);
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// });

app.put("/api/personal-details/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, aboutYou, gender, birthday, language } = req.body;

    const parsedUserId = parseInt(userId, 10);
    if (isNaN(parsedUserId) || parsedUserId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId parameter.",
      });
    }

    const formattedLang = language;

    // 1. Check if PersonalDetails record exists for this userId and language
    let details = await PersonalDetails.findOne({
      where: {
        userId: parsedUserId,
        language: formattedLang,
      },
    });

    if (details) {
      // Update existing record
      await details.update({
        name,
        aboutYou,
        gender,
        birthday,
        language: formattedLang,
      });
    } else {
      // Create new record if it doesn't exist (upsert equivalent)
      details = await PersonalDetails.create({
        userId: parsedUserId,
        name,
        aboutYou,
        gender,
        birthday,
        language: formattedLang,
      });
    }

    // 2. Update the username in the User model if provided
    if (name) {
      await User.update(
        { username: name },
        {
          where: { id: parsedUserId },
        },
      );
    }

    return res.status(200).json({
      success: true,
      message: "Personal details updated successfully",
      data: details,
    });
  } catch (error) {
    console.error("Error updating personal details:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
});
// app.put("/api/personal-details/:userId/profile-image", async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const { profileImage, language } = req.body;
//     const targetLanguage = language || req.query.language;

//     const parsedUserId = parseInt(userId, 10);
//     if (isNaN(parsedUserId) || parsedUserId <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid user ID format",
//       });
//     }

//     const newImageUrl = profileImage;

//     if (
//       !newImageUrl ||
//       typeof newImageUrl !== "string" ||
//       !newImageUrl.trim()
//     ) {
//       return res
//         .status(400)
//         .json({ success: false, message: "No S3 media URL provided" });
//     }

//     if (!targetLanguage) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Language parameter is required" });
//     }

//     const cleanImageUrl = newImageUrl.trim();

//     // 1. Fetch existing record to check for old S3 image cleanup
//     const [existingRows] = await db.execute(
//       `SELECT profileImage FROM personaldetails WHERE userId = ? AND language = ?`,
//       [parsedUserId, targetLanguage],
//     );

//     if (existingRows.length > 0 && existingRows[0].profileImage) {
//       const oldImageUrl = existingRows[0].profileImage;
//       const s3Key = getS3KeyFromUrl(oldImageUrl);

//       if (s3Key) {
//         try {
//           await s3.send(
//             new DeleteObjectCommand({
//               Bucket: process.env.AWS_BUCKET_NAME,
//               Key: s3Key,
//             }),
//           );
//           console.log(
//             `Successfully deleted old profile image S3 key: ${s3Key}`,
//           );
//         } catch (s3Err) {
//           console.error(`Failed to delete old S3 image key (${s3Key}):`, s3Err);
//         }
//       }
//     }

//     // 2. Perform UPSERT with ON DUPLICATE KEY UPDATE
//     const upsertQuery = `
//       INSERT INTO personaldetails (userId, language, profileImage)
//       VALUES (?, ?, ?)
//       ON DUPLICATE KEY UPDATE
//         profileImage = VALUES(profileImage),
//         updated_at = CURRENT_TIMESTAMP
//     `;

//     await db.execute(upsertQuery, [
//       parsedUserId,
//       targetLanguage,
//       cleanImageUrl,
//     ]);

//     // 3. Fetch updated record to maintain return payload contract
//     const [updatedRows] = await db.execute(
//       `SELECT * FROM personaldetails WHERE userId = ? AND language = ?`,
//       [parsedUserId, targetLanguage],
//     );

//     return res.status(200).json({
//       success: true,
//       message: "Profile image updated successfully",
//       data: updatedRows[0] || null,
//     });
//   } catch (error) {
//     console.error("Error updating profile image:", error);
//     return res.status(500).json({ success: false, message: error.message });
//   }
// });

app.put("/api/personal-details/:userId/profile-image", async (req, res) => {
  try {
    const { userId } = req.params;
    const { profileImage, language } = req.body;
    const targetLanguage = language || req.query.language;

    const parsedUserId = parseInt(userId, 10);
    if (isNaN(parsedUserId) || parsedUserId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }

    const newImageUrl = profileImage;

    if (
      !newImageUrl ||
      typeof newImageUrl !== "string" ||
      !newImageUrl.trim()
    ) {
      return res
        .status(400)
        .json({ success: false, message: "No S3 media URL provided" });
    }

    if (!targetLanguage) {
      return res
        .status(400)
        .json({ success: false, message: "Language parameter is required" });
    }

    const cleanImageUrl = newImageUrl.trim();

    // 1. Fetch existing record to check for old S3 image cleanup using Sequelize
    const existingDetails = await PersonalDetails.findOne({
      where: {
        userId: parsedUserId,
        language: targetLanguage,
      },
      attributes: ["profileImage"],
    });

    if (existingDetails && existingDetails.profileImage) {
      const oldImageUrl = existingDetails.profileImage;
      const s3Key = getS3KeyFromUrl(oldImageUrl);

      if (s3Key) {
        try {
          await s3.send(
            new DeleteObjectCommand({
              Bucket: process.env.AWS_BUCKET_NAME,
              Key: s3Key,
            }),
          );
          console.log(
            `Successfully deleted old profile image S3 key: ${s3Key}`,
          );
        } catch (s3Err) {
          console.error(`Failed to delete old S3 image key (${s3Key}):`, s3Err);
        }
      }
    }

    // 2. Perform UPSERT with Sequelize
    await PersonalDetails.upsert({
      userId: parsedUserId,
      language: targetLanguage,
      profileImage: cleanImageUrl,
    });

    // 3. Fetch updated record to return in response
    const updatedDetails = await PersonalDetails.findOne({
      where: {
        userId: parsedUserId,
        language: targetLanguage,
      },
    });

    const data = updatedDetails ? updatedDetails.toJSON() : null;
    if (data) {
      data._id = data.id; // Compatibility mapping for client apps expecting MongoDB-style _id
    }

    return res.status(200).json({
      success: true,
      message: "Profile image updated successfully",
      data,
    });
  } catch (error) {
    console.error("Error updating profile image:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// app.delete("/api/personal-details/:userId/profile-image", async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const { language } = req.query;

//     const parsedUserId = parseInt(userId, 10);
//     if (isNaN(parsedUserId) || parsedUserId <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid user ID format",
//       });
//     }

//     if (!language) {
//       return res.status(400).json({
//         success: false,
//         message: "Language query parameter is required",
//       });
//     }

//     // 1. Fetch user record to check for an existing profile image
//     const [rows] = await db.execute(
//       `SELECT * FROM personaldetails WHERE userId = ? AND language = ?`,
//       [parsedUserId, language],
//     );

//     if (rows.length === 0 || !rows[0].profileImage) {
//       return res
//         .status(400)
//         .json({ success: false, message: "No profile image to delete" });
//     }

//     const currentDetails = rows[0];

//     // 2. Delete the physical image file from storage disk if it exists
//     const fileName = currentDetails.profileImage.split("/uploads/").pop();
//     if (fileName) {
//       const filePath = path.join(process.cwd(), "uploads", fileName);
//       if (fs.existsSync(filePath)) {
//         fs.unlinkSync(filePath);
//       }
//     }

//     // 3. Clear the profileImage column in the database
//     await db.execute(
//       `UPDATE personaldetails
//        SET profileImage = '', updated_at = CURRENT_TIMESTAMP
//        WHERE userId = ? AND language = ?`,
//       [parsedUserId, language],
//     );

//     // 4. Return updated details record
//     const updatedDetails = {
//       ...currentDetails,
//       profileImage: "",
//     };

//     return res.status(200).json({
//       success: true,
//       message: "Profile image deleted successfully",
//       data: updatedDetails,
//     });
//   } catch (error) {
//     console.error("Error deleting profile image:", error);
//     return res.status(500).json({ success: false, message: error.message });
//   }
// });

app.delete("/api/personal-details/:userId/profile-image", async (req, res) => {
  try {
    const { userId } = req.params;
    const { language } = req.query;

    const parsedUserId = parseInt(userId, 10);
    if (isNaN(parsedUserId) || parsedUserId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }

    if (!language) {
      return res.status(400).json({
        success: false,
        message: "Language query parameter is required",
      });
    }

    // 1. Fetch user record to check for an existing profile image using Sequelize
    const detailsInstance = await PersonalDetails.findOne({
      where: {
        userId: parsedUserId,
        language,
      },
    });

    if (!detailsInstance || !detailsInstance.profileImage) {
      return res
        .status(400)
        .json({ success: false, message: "No profile image to delete" });
    }

    const currentDetails = detailsInstance.toJSON();

    // 2. Delete the physical image file from storage disk if it exists
    const fileName = currentDetails.profileImage.split("/uploads/").pop();
    if (fileName) {
      const filePath = path.join(process.cwd(), "uploads", fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // 3. Clear the profileImage column in the database using Sequelize
    await PersonalDetails.update(
      { profileImage: "" },
      {
        where: {
          userId: parsedUserId,
          language,
        },
      },
    );

    // 4. Return updated details record
    const updatedDetails = {
      ...currentDetails,
      _id: currentDetails.id, // Map ID for frontend contract compatibility
      profileImage: "",
    };

    return res.status(200).json({
      success: true,
      message: "Profile image deleted successfully",
      data: updatedDetails,
    });
  } catch (error) {
    console.error("Error deleting profile image:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// app.get("/api/admin-profile", async (req, res) => {
//   try {
//     const query = `
//       SELECT
//         u.id AS _id,
//         u.username,
//         u.mobile,
//         u.role,
//         u.courseType,
//         u.language,
//         COALESCE(pd.profileImage, '') AS profileImage
//       FROM register u
//       LEFT JOIN personaldetails pd ON u.id = pd.userId
//       WHERE LOWER(TRIM(u.role)) = 'admin'
//       ORDER BY
//         (pd.profileImage IS NOT NULL AND pd.profileImage != '') DESC,
//         pd.created_at DESC
//     `;

//     const [rows] = await db.execute(query);

//     if (!rows || rows.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "No admin found",
//       });
//     }

//     const adminMap = new Map();

//     for (const row of rows) {
//       if (!adminMap.has(row._id)) {
//         let parsedCourseType = row.courseType;
//         if (typeof parsedCourseType === "string") {
//           try {
//             parsedCourseType = JSON.parse(parsedCourseType || "[]");
//           } catch {
//             parsedCourseType = [row.courseType];
//           }
//         }

//         adminMap.set(row._id, {
//           _id: row._id,
//           username: row.username || "",
//           mobile: row.mobile || "",
//           role: row.role || "",
//           courseType: parsedCourseType || [],
//           language: row.language || "",
//           profileImage: row.profileImage || "",
//         });
//       }
//     }

//     return res.status(200).json({
//       success: true,
//       data: Array.from(adminMap.values()),
//     });
//   } catch (error) {
//     console.error("Error fetching admin profile:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Error fetching admin profile",
//       error: error.message,
//     });
//   }
// });

// app.get("/api/admin-profile", async (req, res) => {
//   try {
//     const adminDetails = await User.findAll({
//       where: { role: "admin" },
//       attributes: [
//         "id",
//         "username",
//         "mobile",
//         "role",
//         "courseType",
//         "language",
//       ],
//       include: [
//         {
//           model: PersonalDetails,
//           attributes: ["profileImage", "createdAt"],
//           required: false, // LEFT OUTER JOIN
//         },
//       ],
//       order: [
//         // Sorts associated PersonalDetails: prioritizing non-empty profileImage, then latest createdAt
//         [
//           PersonalDetails,
//           sequelize.literal(
//             "CASE WHEN `PersonalDetails`.`profileImage` IS NOT NULL AND `PersonalDetails`.`profileImage` != '' THEN 1 ELSE 0 END",
//           ),
//           "DESC",
//         ],
//         [PersonalDetails, "createdAt", "DESC"],
//       ],
//     });

//     if (!adminDetails || adminDetails.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "No admin found",
//       });
//     }

//     // Format output structure to match original response shape
//     const formattedAdmins = adminDetails.map((admin) => {
//       const adminPlain = admin.get({ plain: true });

//       // Get profileImage from the top ordered PersonalDetails record
//       const topProfile = adminPlain.PersonalDetails?.[0];
//       const profileImage = topProfile?.profileImage || "";

//       // Remove nested PersonalDetails array to match $project shape
//       delete adminPlain.PersonalDetails;

//       return {
//         ...adminPlain,
//         profileImage,
//       };
//     });

//     return res.status(200).json({
//       success: true,
//       data: formattedAdmins,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Error fetching admin profile",
//       error: error.message,
//     });
//   }
// });

app.get("/api/admin-profile", async (req, res) => {
  try {
    const adminDetails = await User.findAll({
      where: { role: "admin" },
      attributes: [
        "id",
        "username",
        "mobile",
        "role",
        "courseType",
        "language",
      ],
      include: [
        {
          model: PersonalDetails,
          attributes: ["profileImage", "createdAt"],
          required: false,
        },
      ],
      order: [[PersonalDetails, "createdAt", "DESC"]],
    });

    if (!adminDetails || adminDetails.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No admin found",
      });
    }

    const formattedAdmins = adminDetails.map((admin) => {
      const adminPlain = admin.get({ plain: true });
      const detailsList = adminPlain.PersonalDetails || [];

      // Find the first record with a non-empty profileImage, or fall back to the newest record
      const imageRecord =
        detailsList.find(
          (d) => d.profileImage && d.profileImage.trim() !== "",
        ) || detailsList[0];

      delete adminPlain.PersonalDetails;

      return {
        ...adminPlain,
        profileImage: imageRecord?.profileImage || "",
      };
    });

    return res.status(200).json({
      success: true,
      data: formattedAdmins,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching admin profile",
      error: error.message,
    });
  }
});

app.post("/api/media/upload-url", async (req, res) => {
  try {
    const { fileType, folder } = req.body;
    // fileType ex: 'image/jpeg', 'video/mp4', 'audio/mpeg'

    if (!fileType) {
      return res
        .status(400)
        .json({ success: false, message: "fileType is required" });
    }

    const { uploadUrl, fileUrl } = await generateUploadUrl(
      fileType,
      folder || "uploads",
    );

    return res.status(200).json({
      success: true,
      uploadUrl, // Used by Angular to PUT the file directly to S3
      fileUrl, // Saved to MySQL/MongoDB database
    });
  } catch (error) {
    console.error("S3 Presigned URL error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to generate upload URL" });
  }
});

app.post("/api/upload_parallel", uploadS3.single("file"), async (req, res) => {
  const file = req.file;

  if (!file) {
    return res
      .status(400)
      .json({ success: false, message: "No file provided" });
  }

  // 1. Check for explicit folder passed via body or query parameters
  const requestedFolder = req.body.folder || req.query.folder;

  // Determine folder based on MIME type
  let folder = "others";
  if (requestedFolder === "courseThumbnail") {
    folder = "courseThumbnail";
  } else if (file.mimetype.startsWith("image/")) {
    folder = "images";
  } else if (file.mimetype.startsWith("video/")) {
    folder = "videos";
  } else if (file.mimetype.startsWith("audio/")) {
    folder = "audios";
  }

  // Construct Key with folder prefix
  const params = {
    Bucket: bucketName,
    Key: `${folder}/${Date.now().toString()}_${file.originalname}`,
    Body: file.buffer,
    ContentType: file.mimetype, // Recommended: preserves file viewer support in browser
  };

  try {
    const uploadParallel = new Upload({
      client: s3,
      queueSize: 4,
      partSize: 5542880,
      leavePartsOnError: false,
      params,
    });

    uploadParallel.on("httpUploadProgress", (progress) => {
      console.log(progress);
    });

    const data = await uploadParallel.done();
    console.log("upload completed!", { data });

    // Verify upload success by checking returned S3 Location URL
    return res.json({ success: true, data: data.Location });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Deletes file from the root 'uploads' directory
 */
const removeFileFromUploads = (imageUrl) => {
  if (!imageUrl) return;

  // 1. Extract just the filename (e.g., '1710000000-image.jpg')
  const filename = path.basename(imageUrl);

  // 2. Resolve path starting directly from project root
  const absolutePath = path.join(process.cwd(), "uploads", filename);

  console.log("Attempting to delete file at:", absolutePath);

  // 3. Delete file asynchronously
  fs.unlink(absolutePath, (err) => {
    if (err) {
      console.error("File deletion failed:", err.message);
    } else {
      console.log("File successfully deleted from disk!");
    }
  });
};

// GET /api/events
app.get("/api/events", async (req, res) => {
  try {
    const rawLanguage = req.query.language;
    const language = rawLanguage;

    const events = await Event.findAll({
      where: { language },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/events
app.post("/api/events", upload.single("image"), async (req, res) => {
  try {
    const { title, language } = req.body;
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Please upload an image" });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    const newEvent = await Event.create({
      title,
      language,
      imageUrl,
    });

    res.status(201).json({ success: true, data: newEvent });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/events/:id
app.put("/api/events/:id", upload.single("image"), async (req, res) => {
  try {
    const { title, language } = req.body;
    const event = await Event.findByPk(req.params.id);

    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    let imageUrl = event.imageUrl;

    // If a new file is uploaded, remove the old file and assign new path
    if (req.file) {
      removeFileFromUploads(event.imageUrl);
      imageUrl = `/uploads/${req.file.filename}`;
    }

    event.title = title || event.title;
    if (language) {
      event.language = language;
    }
    event.imageUrl = imageUrl;

    await event.save();
    res.status(200).json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/events/:id
app.delete("/api/events/:id", async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    // 1. Delete image file from disk
    removeFileFromUploads(event.imageUrl);

    // 2. Delete record from database
    await event.destroy();

    res.status(200).json({
      success: true,
      message: "Event and associated image deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET ALL ITEMS
app.get("/api/nutrition", async (req, res) => {
  try {
    const { language } = req.query;
    const whereClause = {};

    if (language) {
      const targetLang =
        language.toLowerCase() === "te" || language.toLowerCase() === "telugu"
          ? "Telugu"
          : "English";
      whereClause.language = targetLang;
    }

    const items = await Nutrition.findAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({ success: true, data: items });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET SINGLE ITEM BY ID
app.get("/api/nutrition/:id", async (req, res) => {
  try {
    const item = await Nutrition.findByPk(req.params.id);

    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }

    return res.status(200).json({ success: true, data: item });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// CREATE ITEM
app.post("/api/nutrition", async (req, res) => {
  try {
    const { title, category, language, imageUrl, ingredients, description } =
      req.body;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: "Image URL is required",
      });
    }

    const newItem = await Nutrition.create({
      title,
      category,
      language,
      imageUrl,
      ingredients,
      description,
    });

    return res.status(201).json({ success: true, data: newItem });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// UPDATE ITEM
app.put("/api/nutrition/:id", async (req, res) => {
  try {
    const item = await Nutrition.findByPk(req.params.id);

    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }

    const updatedItem = await item.update(req.body);

    return res.status(200).json({ success: true, data: updatedItem });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE ITEM
app.delete("/api/nutrition/:id", async (req, res) => {
  try {
    const item = await Nutrition.findByPk(req.params.id);

    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }

    await item.destroy();

    return res
      .status(200)
      .json({ success: true, message: "Item deleted successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Mount the course routes under the '/api/courses' prefix
app.use("/api/course", courseRoutes);

const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
const startServer = async () => {
  await db();
  await syncDatabase(); // Sync tables
  app.listen(5000, () => console.log("Server running on port 5000"));
};

startServer();
