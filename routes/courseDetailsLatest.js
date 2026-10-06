import express from "express";
import Course from "../models/Course.js";

const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const region = process.env.AWS_REGION || "eu-north-1";
const bucketName = process.env.AWS_BUCKET_NAME;

const s3Client = new S3Client({
  region: region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Helper function to generate time-limited signed URL for a given S3 key
async function getObjectSignedURL(key, expiresInSeconds = 3600) {
  if (!key) return null;
  
  // If a full URL was stored instead of a key, extract the object key
  if (key.startsWith("http")) {
    key = key.split(".amazonaws.com/")[1];
  }

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  // Generates URL valid for 1 hour by default
  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
  return signedUrl;
}

const router = express.Router();

// Helper to extract & normalize language from query, body, or headers
const extractLanguage = (req) => {
  const input =
    req.query.language ||
    req.body.language ||
    req.headers["x-language"] ||
    "English";

  const lower = String(input).trim().toLowerCase();
  if (lower === "te" || lower === "telugu") return "Telugu";
  return "English";
};

// -----------------------------------------------------------------------------
// GET: Fetch all courses by language (/api/course?language=Telugu)
// -----------------------------------------------------------------------------
// router.get("/", async (req, res) => {
//   try {
//     const language = extractLanguage(req);
//     const courses = await Course.find({ language });

//     return res.status(200).json({ success: true, data: courses });
//   } catch (error) {
//     return res.status(500).json({ success: false, message: error.message });
//   }
// });

router.get("/:id", async (req, res) => {
  try {
    const language = extractLanguage(req);
    // Use .lean() so we can modify the returned object properties easily
    const course = await Course.findOne({ _id: req.params.id, language }).lean();

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    // 1. Sign main course thumbnail if key exists
    if (course.thumbnailKey) {
      course.thumbnailUrl = await getObjectSignedURL(course.thumbnailKey);
    }

    // 2. Map through lectures/modules and generate pre-signed URLs for media files
    if (course.lectures && Array.isArray(course.lectures)) {
      course.lectures = await Promise.all(
        course.lectures.map(async (lecture) => {
          if (lecture.videoKey) {
            lecture.videoUrl = await getObjectSignedURL(lecture.videoKey, 3600); // 1 hr expiry
          }
          if (lecture.audioKey) {
            lecture.audioUrl = await getObjectSignedURL(lecture.audioKey, 3600);
          }
          if (lecture.imageKey) {
            lecture.imageUrl = await getObjectSignedURL(lecture.imageKey, 3600);
          }
          return lecture;
        })
      );
    }

    return res.status(200).json({ success: true, data: course });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});
// -----------------------------------------------------------------------------
// GET: Fetch single course by ID & language (/api/course/:id?language=English)
// -----------------------------------------------------------------------------
router.get("/:id", async (req, res) => {
  try {
    const language = extractLanguage(req);
    const course = await Course.findOne({ _id: req.params.id, language });

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    return res.status(200).json({ success: true, data: course });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// -----------------------------------------------------------------------------
// POST: Create a new course (/api/course)
// -----------------------------------------------------------------------------
router.post("/", async (req, res) => {
  try {
    const language = extractLanguage(req);
    const { title, description, instructor, thumbnail, isPaid, isNewCourse } =
      req.body;

    const course = await Course.create({
      title,
      description,
      instructor,
      thumbnail,
      isPaid,
      isNewCourse,
      language,
    });

    return res.status(201).json({ success: true, data: course });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// -----------------------------------------------------------------------------
// POST: Add video lecture via URL (/api/course/:id/lectures?language=Telugu)
// -----------------------------------------------------------------------------
router.post("/:id/lectures", async (req, res) => {
  try {
    const { title, videoUrl, language } = req.body;

    if (!videoUrl) {
      return res
        .status(400)
        .json({ success: false, message: "Video URL is required" });
    }

    const updatedCourse = await Course.findOneAndUpdate(
      { _id: req.params.id, language },
      { $push: { lectures: { title, videoUrl } } },
      { returnDocument: "after", runValidators: true },
    );

    if (!updatedCourse) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Lecture added successfully",
      data: updatedCourse,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// -----------------------------------------------------------------------------
// PUT: Update course details (/api/course/:id?language=Telugu)
// -----------------------------------------------------------------------------
router.put("/:id", async (req, res) => {
  try {
    const language = extractLanguage(req);

    const updatedCourse = await Course.findOneAndUpdate(
      { _id: req.params.id, language },
      { $set: { ...req.body, language } },
      { returnDocument: "after", runValidators: true },
    );

    if (!updatedCourse) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// -----------------------------------------------------------------------------
// DELETE: Delete course (/api/course/:id?language=Telugu)
// -----------------------------------------------------------------------------
router.delete("/:id", async (req, res) => {
  try {
    const language = extractLanguage(req);
    const course = await Course.findOneAndDelete({
      _id: req.params.id,
      language,
    });

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Course deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// -----------------------------------------------------------------------------
// PUT: Edit an existing lecture (Title and/or videoUrl)
// -----------------------------------------------------------------------------
router.put("/:id/lectures/:lectureId", async (req, res) => {
  try {
    // const language = extractLanguage(req);
    const { id, lectureId } = req.params;
    const { title, videoUrl, language } = req.body;

    const updateData = {};
    if (title) updateData["lectures.$.title"] = title;
    if (videoUrl) updateData["lectures.$.videoUrl"] = videoUrl;

    const updatedCourse = await Course.findOneAndUpdate(
      { _id: id, "lectures._id": lectureId, language },
      { $set: updateData },
      { returnDocument: "after", runValidators: true },
    );

    if (!updatedCourse) {
      return res
        .status(404)
        .json({ success: false, message: "Course or lecture not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Lecture updated successfully",
      data: updatedCourse,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// -----------------------------------------------------------------------------
// DELETE: Remove a specific lecture from a course
// -----------------------------------------------------------------------------
router.delete("/:id/lectures/:lectureId", async (req, res) => {
  try {
    const language = extractLanguage(req);
    const { id, lectureId } = req.params;

    const updatedCourse = await Course.findOneAndUpdate(
      { _id: id, language },
      { $pull: { lectures: { _id: lectureId } } },
      { returnDocument: "after" },
    );

    if (!updatedCourse) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Lecture deleted successfully",
      data: updatedCourse,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
