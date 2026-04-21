import ChatHistory from "../models/ChatHistory.js";

export async function getHistory(_req, res, next) {
  try {
    const history = await ChatHistory.find()
      .sort({ updatedAt: -1 })
      .select("title lastQuestion studentName sessionId updatedAt createdAt messages");

    res.json({ history });
  } catch (error) {
    next(error);
  }
}

export async function getSessionHistory(req, res, next) {
  try {
    const session = await ChatHistory.findOne({ sessionId: req.params.sessionId });

    if (!session) {
      return res.status(404).json({ message: "Session not found." });
    }

    res.json({ session });
  } catch (error) {
    next(error);
  }
}
