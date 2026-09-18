import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    content: {
      type: String,
      trim: true,
      default: "",
    },
    language: {
      type: String,
      enum: ["English", "Telugu"],
      required: true,
      index: true,
    },
    tagIds: [{ type: String }],
    courseType: {
      type: String,
      enum: ["Face Yoga", "Face Yoga + Raj Yoga"],
    },
    // Updated media storage for S3 URLs
    mediaFiles: [
      {
        fileLink: { type: String, required: true },
        mediaType: {
          type: String,
          enum: ["image", "video", "audio", "file"],
          default: "file",
        },
      },
    ],
    views: { type: Number, default: 0 },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    likeCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// Compound index for fast language timeline lookups
PostSchema.index({ language: 1, createdAt: -1 });

const Post = mongoose.model("Post", PostSchema);
export default Post;
