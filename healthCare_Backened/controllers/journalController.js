import Journal from "../models/Journal.js";

// create a new journal entry for logged-in user
export const createJournal = async (req, res) => {
  try {
    const { title, content } = req.body;
    const journal = await Journal.create({
      user: req.user._id,
      title,
      content
    });
    res.status(201).json(journal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// get all journals belonging to authenticated user
export const getJournals = async (req, res) => {
  try {
    const journals = await Journal.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(journals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// get single journal entry by id (must belong to user)
export const getJournal = async (req, res) => {
  try {
    const journal = await Journal.findOne({ _id: req.params.id, user: req.user._id });
    if (!journal) return res.status(404).json({ message: "Journal not found" });
    res.json(journal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// optionally update and delete
export const updateJournal = async (req, res) => {
  try {
    const { title, content } = req.body;
    const journal = await Journal.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { title, content },
      { new: true }
    );
    if (!journal) return res.status(404).json({ message: "Journal not found" });
    res.json(journal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteJournal = async (req, res) => {
  try {
    const journal = await Journal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!journal) return res.status(404).json({ message: "Journal not found" });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};