const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const User = require('../models/User');
const auth = require('../middleware/auth');

// GET /api/tasks - Get available tasks
router.get('/', auth, async (req, res) => {
  try {
    const { category, difficulty, featured } = req.query;
    const query = { isActive: true };

    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (featured === 'true') query.featured = true;

    const tasks = await Task.find(query)
      .sort({ featured: -1, pointsReward: -1 })
      .limit(50);

    // Filter tasks user can complete
    const user = await User.findById(req.user.id);
    const availableTasks = tasks.filter(task => task.canComplete(user));

    res.json({
      success: true,
      data: availableTasks,
      count: availableTasks.length
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tasks',
      error: error.message
    });
  }
});

// POST /api/tasks/:id/complete - Complete a task
router.post('/:id/complete', [
  auth,
  body('completionData').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const task = await Task.findById(req.params.id);
    if (!task || !task.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or inactive'
      });
    }

    const user = await User.findById(req.user.id);
    
    if (!task.canComplete(user)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot complete this task',
        reason: 'Already completed or requirements not met'
      });
    }

    // Award points to user
    user.points += task.pointsReward;
    
    // Add task to completed tasks
    user.completedTasks.push({
      taskId: task._id,
      pointsEarned: task.pointsReward,
      completedAt: new Date()
    });
    
    user.calculateLevel();
    
    // Update task completion count
    await task.processCompletion();
    await user.save();

    res.json({
      success: true,
      message: 'Task completed successfully',
      data: {
        pointsEarned: task.pointsReward,
        userPoints: user.points,
        userLevel: user.level,
        levelUp: user.level > user.calculateLevel()
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to complete task',
      error: error.message
    });
  }
});

module.exports = router;