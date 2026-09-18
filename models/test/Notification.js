import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: ["post", "comment"],
    default: "post",
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "postModel",
  },
  commentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment",
    default: null,
  },
  postModel: {
    type: String,
    required: true,
    enum: ["Post", "AdminPost"],
    default: "Post",
  },
  postContentSnippet: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Notification", notificationSchema);
