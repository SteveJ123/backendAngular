# backend

https://backend-2rgv.onrender.com/api/posts

app.post "/api/posts"

get stored in mediaFiles there are \\
mediaFiles": "[{\"fileLink\":\"https://younghappy.s3.us-east-1.amazonaws.com/images/1789729846419_edit.png\",\"mediaType\":\"image\"}]",

added in
app.get "/api/posts"
parseJsonField method to clean \
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

and in return
mediaFiles: parseJsonField(post.mediaFiles || []),

-- 1. Create Courses Table
CREATE TABLE IF NOT EXISTS `courses` (
`id` INT AUTO_INCREMENT PRIMARY KEY,
`title` ENUM('Face Yoga', 'Face Yoga + Raj Yoga') NOT NULL,
`description` TEXT NOT NULL,
`instructor` VARCHAR(255) DEFAULT 'Pooja Agarwala',
`thumbnail` VARCHAR(255) NOT NULL,
`progress` FLOAT DEFAULT 0 CHECK (`progress` >= 0 AND `progress` <= 100),
`status` ENUM('in_progress', 'completed', 'not_started') DEFAULT 'not_started',
`isPaid` BOOLEAN DEFAULT FALSE,
`isNewCourse` BOOLEAN DEFAULT TRUE,
`language` ENUM('English', 'Telugu') NOT NULL,
`createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
`updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
INDEX `idx_courses_language` (`language`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Create Lectures Table
CREATE TABLE IF NOT EXISTS `lectures` (
`id` INT AUTO_INCREMENT PRIMARY KEY,
`courseId` INT NOT NULL,
`title` VARCHAR(255) NOT NULL,
`videoUrl` VARCHAR(255) NOT NULL,
`createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
`updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
FOREIGN KEY (`courseId`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 1. Create Course Details Table
CREATE TABLE IF NOT EXISTS `course_details` (
`id` INT AUTO_INCREMENT PRIMARY KEY,
`title` VARCHAR(255) NOT NULL,
`description` TEXT DEFAULT NULL,
`instructor` VARCHAR(255) DEFAULT NULL,
`thumbnail` VARCHAR(255) DEFAULT NULL,
`membershipType` VARCHAR(255) DEFAULT NULL,
`createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
`updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Create Lecture Details Table
CREATE TABLE IF NOT EXISTS `lecture_details` (
`id` INT AUTO_INCREMENT PRIMARY KEY,
`courseDetailsId` INT NOT NULL,
`title` VARCHAR(255) NOT NULL,
`videoUrl` VARCHAR(255) NOT NULL,
`duration` VARCHAR(255) DEFAULT NULL,
`createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
`updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
FOREIGN KEY (`courseDetailsId`) REFERENCES `course_details` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `events` (
`id` INT AUTO_INCREMENT PRIMARY KEY,
`title` VARCHAR(255) NOT NULL,
`imageUrl` VARCHAR(255) NOT NULL,
`language` ENUM('English', 'Telugu') NOT NULL DEFAULT 'English',
`createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
`updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `live_sessions` (
`id` INT AUTO_INCREMENT PRIMARY KEY,
`title` VARCHAR(255) NOT NULL,
`date` VARCHAR(255) NOT NULL,
`startTime` VARCHAR(255) NOT NULL,
`endTime` VARCHAR(255) NOT NULL,
`occurrence` VARCHAR(255) DEFAULT '',
`linkTypeNote` VARCHAR(255) DEFAULT '(Zoom Meeting - recurring fixed link)',
`meetingUrl` VARCHAR(255) NOT NULL,
`courseType` ENUM('Face Yoga', 'Face Yoga + Raj Yoga') NOT NULL DEFAULT 'Face Yoga',
`language` ENUM('English', 'Telugu') NOT NULL,
`createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
`updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
INDEX `idx_live_sessions_language` (`language`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `products` (
`id` INT AUTO_INCREMENT PRIMARY KEY,
`title` VARCHAR(255) NOT NULL,
`productUrl` VARCHAR(255) NOT NULL,
`imageUrl` VARCHAR(255) NOT NULL,
`language` ENUM('English', 'Telugu') NOT NULL,
`createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
`updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
INDEX `idx_products_language` (`language`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `support_team` (
`id` INT AUTO_INCREMENT PRIMARY KEY,
`name` VARCHAR(255) NOT NULL,
`role` VARCHAR(255) NOT NULL,
`avatar` VARCHAR(255) DEFAULT 'https://via.placeholder.com/150',
`phone` VARCHAR(255) NOT NULL,
`email` VARCHAR(255) NOT NULL,
`available` TINYINT(1) DEFAULT 1,
`language` ENUM('English', 'Telugu') NOT NULL,
`createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
`updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
INDEX `idx_support_team_language` (`language`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `nutritions` (
`id` INT AUTO_INCREMENT PRIMARY KEY,
`title` VARCHAR(255) NOT NULL,
`category` ENUM('nutritiousFood', 'healthyDrink') NOT NULL,
`language` ENUM('English', 'Telugu') DEFAULT 'Telugu',
`imageUrl` VARCHAR(255) NOT NULL,
`ingredients` TEXT NOT NULL,
`description` TEXT NOT NULL,
`createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
