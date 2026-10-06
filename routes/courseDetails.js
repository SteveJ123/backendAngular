import express from "express";
import { Course, Lecture } from "../models/index.js";


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
router.get("/", async (req, res) => {
  try {
    const language = extractLanguage(req);
    const courses = await Course.findAll({
      where: { language },
      include: [{ model: Lecture, as: "lectures" }],
    });

    return res.status(200).json({ success: true, data: courses });
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
    const course = await Course.findOne({
      where: { id: req.params.id, language },
      include: [{ model: Lecture, as: "lectures" }],
    });

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
// router.post("/:id/lectures", async (req, res) => {
//   try {
//     const { title, videoUrl, language } = req.body;

//     if (!videoUrl) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Video URL is required" });
//     }

//     // Verify course exists
//     const course = await Course.findOne({
//       where: { id: req.params.id, language },
//     });

//     if (!course) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Course not found" });
//     }

//     // Create child lecture record
//     await Lecture.create({
//       title,
//       videoUrl,
//       CourseId: course.id,
//     });

//     // Refetch course with embedded lectures array
//     const updatedCourse = await Course.findOne({
//       where: { id: req.params.id, language },
//       include: [{ model: Lecture, as: "lectures" }],
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Lecture added successfully",
//       data: updatedCourse,
//     });
//   } catch (error) {
//     return res.status(500).json({ success: false, message: error.message });
//   }
// });
router.post("/:id/lectures", async (req, res) => {
  try {
    const { title, videoUrl, language } = req.body;

    if (!videoUrl) {
      return res
        .status(400)
        .json({ success: false, message: "Video URL is required" });
    }

    // Verify course exists
    const course = await Course.findOne({
      where: { id: req.params.id, language },
    });

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    // Create child lecture record using 'courseId' instead of 'CourseId'
    await Lecture.create({
      title,
      videoUrl,
      courseId: course.id,
    });

    // Refetch course with embedded lectures array
    const updatedCourse = await Course.findOne({
      where: { id: req.params.id, language },
      include: [{ model: Lecture, as: "lectures" }],
    });

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

    const course = await Course.findOne({
      where: { id: req.params.id, language },
    });

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    await course.update({ ...req.body, language });

    const updatedCourse = await Course.findOne({
      where: { id: req.params.id },
      include: [{ model: Lecture, as: "lectures" }],
    });

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
    const course = await Course.findOne({
      where: { id: req.params.id, language },
    });

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    await course.destroy();

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
    const { id, lectureId } = req.params;
    const { title, videoUrl, language } = req.body;

    // Verify parent course exists
    const course = await Course.findOne({
      where: { id, language },
    });

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course or lecture not found" });
    }

    // Find and update target lecture
    const lecture = await Lecture.findOne({
      where: { id: lectureId, CourseId: id },
    });

    if (!lecture) {
      return res
        .status(404)
        .json({ success: false, message: "Course or lecture not found" });
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (videoUrl) updateData.videoUrl = videoUrl;

    await lecture.update(updateData);

    const updatedCourse = await Course.findOne({
      where: { id },
      include: [{ model: Lecture, as: "lectures" }],
    });

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

    const course = await Course.findOne({
      where: { id, language },
    });

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    const lecture = await Lecture.findOne({
      where: { id: lectureId, CourseId: id },
    });

    if (lecture) {
      await lecture.destroy();
    }

    const updatedCourse = await Course.findOne({
      where: { id },
      include: [{ model: Lecture, as: "lectures" }],
    });

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
