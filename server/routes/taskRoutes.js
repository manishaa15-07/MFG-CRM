const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  completeTask,
  createTaskValidation,
  updateTaskValidation,
} = require('../controllers/taskController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

// All task routes are protected
router.use(auth);

// CRUD routes
router.get('/', getTasks);
router.get('/:id', getTask);
router.post('/', createTaskValidation, validate, createTask);
router.put('/:id', updateTaskValidation, validate, updateTask);
router.delete('/:id', deleteTask);

// Complete task
router.patch('/:id/complete', completeTask);

module.exports = router;
