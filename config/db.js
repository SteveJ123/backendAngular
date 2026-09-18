// import dns from "node:dns";
// import mongoose from "mongoose";

// dns.setServers(["8.8.8.8", "8.8.4.4"]);

// const connectDB = async () => {
//   try {
//     console.log("Connecting to MongoDB Atlas...");

//     await mongoose.connect(process.env.MONGO_URI, {
//       serverSelectionTimeoutMS: 10000,
//     });

//     console.log("MongoDB Atlas Connected Successfully");
//   } catch (error) {
//     console.error("MongoDB Atlas Connection Error:", error);
//     process.exit(1);
//   }
// };

// export default connectDB;

// import mysql from "mysql2/promise";

// let pool;

// const connectDB = async () => {
//   try {
//     console.log("Connecting to MySQL Database...");

//     // Create a connection pool using environment variables or a connection string
//     pool = mysql.createPool(
//       process.env.MYSQL_URI || {
//         host: process.env.DB_HOST,
//         user: process.env.DB_USER,
//         password: process.env.DB_PASSWORD,
//         database: process.env.DB_NAME,
//         port: Number(process.env.DB_PORT) || 3306,
//         waitForConnections: true,
//         connectionLimit: 10,
//         queueLimit: 0,
//         connectTimeout: 10000,
//       }
//     );

//     // Test the connection
//     const connection = await pool.getConnection();
//     console.log("MySQL Database Connected Successfully");
//     connection.release(); // Release back to pool
//   } catch (error) {
//     console.error("MySQL Database Connection Error:", error);
//     process.exit(1);
//   }
// };

// export { pool };
// export default connectDB;

import { Sequelize } from "sequelize";
import dotenv from "dotenv";

// Ensure environment variables are loaded before initializing
dotenv.config();
// Initialize Sequelize instance
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    dialect: "mysql",
    logging: false, // Set to console.log to see raw SQL queries in terminal
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
);

// Connection test function
const connectDB = async () => {
  try {
    console.log("Connecting to MySQL Database via Sequelize...");
    await sequelize.authenticate();
    console.log("MySQL Database Connected Successfully");
  } catch (error) {
    console.error("MySQL Database Connection Error:", error);
    process.exit(1);
  }
};

export { sequelize };
export default connectDB;
