const Task = require('../models/Task');


exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.createTask = async (req, res) => {
  const { title, description, completed } = req.body;

  try {
    const task = new Task({
      title,
      description,
      completed: completed || false,
      user: req.user.id
    });

    const newTask = await task.save();
    res.status(201).json(newTask);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


exports.getTask = async (req, res) => {
  res.json(res.task);
};


exports.updateTask = async (req, res) => {
  const taskId = req.params.id; // ✅ Get task ID from URL params

  try {
    // res.task is already loaded by getUserTask middleware
    const { title, description, completed } = req.body;

    if (title) res.task.title = title;
    if (description) res.task.description = description;
    if (completed !== undefined) res.task.completed = completed;

    // Optional: Log the task ID being updated
    console.log(`Updating task with ID: ${taskId}`);

    const updatedTask = await res.task.save();
    res.json(updatedTask);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


  exports.deleteTaskDirect = async (req, res) => {
  try {
    const taskId = req.params.id;
    const deletedTask = await Task.findByIdAndDelete(taskId);

    if (!deletedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


