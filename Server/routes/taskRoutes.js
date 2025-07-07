const express = require('express');
const router = express.Router();
const {getTasks,createTask,getTask,updateTask,deleteTaskDirect} = require('../controllers/taskController.js');
const flexibleAuth = require('../middleware/flexibleAuth.js'); // NEW: Supports both JWT and API keys
const { getUserTask } = require("../middleware/taskMiddleware.js");

// GET /api/tasks - Get all tasks for logged-in user
router.get('/', flexibleAuth, getTasks);

// POST /api/tasks - Create a new task for logged-in user
router.post('/', flexibleAuth, createTask);

// GET /api/tasks/:id - Get one task (if it belongs to user)
router.get('/:id', flexibleAuth, getUserTask, getTask);

// PUT /api/tasks/:id - Update task (if owned by user)
router.put('/update/:id', flexibleAuth, getUserTask, updateTask);

// DELETE /api/tasks/:id - Delete task (if owned by user)
router.delete('/delete/:id', flexibleAuth, getUserTask, deleteTaskDirect);

module.exports = router;