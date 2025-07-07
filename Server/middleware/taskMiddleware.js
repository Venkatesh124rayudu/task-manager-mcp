const Task = require('../models/Task');
exports.getUserTask = async (req, res, next) => {
  let task;
  try {
    task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Ensure task belongs to logged-in user
    if (task.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'User not authorized' });
    }

    res.task = task;
    next();
  } catch (err) {
    return res.status(500).json({ message: "invalid task id" });
  }
};