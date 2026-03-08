const Task = require('../models/Task');
const ApiError = require('../utils/ApiError');

// @desc    Create a new task
// @route   POST /api/v1/tasks
// @access  Private
const createTask = async (req, res, next) => {
  try {
    req.body.createdBy = req.user.id;
    const task = await Task.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tasks (user sees own, admin sees all)
// @route   GET /api/v1/tasks
// @access  Private
const getTasks = async (req, res, next) => {
  try {
    let query = {};

    // Regular users only see their own tasks
    if (req.user.role !== 'admin') {
      query.createdBy = req.user.id;
    }

    // Filtering
    if (req.query.status) query.status = req.query.status;
    if (req.query.priority) query.priority = req.query.priority;

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const tasks = await Task.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Task.countDocuments(query);

    res.status(200).json({
      success: true,
      count: tasks.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task
// @route   GET /api/v1/tasks/:id
// @access  Private
const getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).populate(
      'createdBy',
      'name email'
    );

    if (!task) {
      return next(new ApiError(404, 'Task not found'));
    }

    // Check ownership (unless admin)
    if (
      task.createdBy._id.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return next(new ApiError(403, 'Not authorized to access this task'));
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task
// @route   PUT /api/v1/tasks/:id
// @access  Private
const updateTask = async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return next(new ApiError(404, 'Task not found'));
    }

    // Check ownership (unless admin)
    if (
      task.createdBy.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return next(new ApiError(403, 'Not authorized to update this task'));
    }

    // Prevent changing createdBy
    delete req.body.createdBy;

    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/v1/tasks/:id
// @access  Private
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return next(new ApiError(404, 'Task not found'));
    }

    // Check ownership (unless admin)
    if (
      task.createdBy.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return next(new ApiError(403, 'Not authorized to delete this task'));
    }

    await Task.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createTask, getTasks, getTask, updateTask, deleteTask };
