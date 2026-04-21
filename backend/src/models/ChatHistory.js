import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["text", "image"],
      default: "text",
    },
  },
  { _id: false },
);

const chatHistorySchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    studentName: {
      type: String,
      default: "Student",
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    lastQuestion: {
      type: String,
      default: "",
    },
    messages: {
      type: [messageSchema],
      default: [],
    },
  },
  { timestamps: true },
);

export default mongoose.model("ChatHistory", chatHistorySchema);
