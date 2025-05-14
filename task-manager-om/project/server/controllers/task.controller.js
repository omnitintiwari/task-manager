import Task from '../models/Task.js';

// Get all tasks for a user
export const getTasks = async (req, res, next) => {
  try {
    const { teamId } = req.query;
    
    let query = { createdBy: req.user._id };
    
    if (teamId) {
      query = { team: teamId };
    }
    
    const tasks = await Task.find(query)
      .sort({ position: 1 })
      .populate('assignedTo', 'username');
    
    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    next(error);
  }
};

// Create a new task
export const createTask = async (req, res, next) => {
  try {
    const { title, description, priority, dueDate, assignedTo, team } = req.body;
    
    // Find max position
    const maxPositionTask = await Task.findOne({
      createdBy: req.user._id,
      ...(team && { team }),
    }).sort({ position: -1 });
    
    const newPosition = maxPositionTask ? maxPositionTask.position + 1 : 0;
    
    const newTask = new Task({
      title,
      description,
      priority,
      dueDate,
      position: newPosition,
      assignedTo,
      team,
      createdBy: req.user._id,
    });
    
    await newTask.save();
    
    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task: newTask,
    });
  } catch (error) {
    next(error);
  }
};

// Get a single task
export const getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'username')
      .populate('createdBy', 'username');
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }
    
    res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    next(error);
  }
};

// Update a task
export const updateTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate, assignedTo, reminderDate } = req.body;
    
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }
    
    // Check if user is authorized
    if (task.createdBy.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this task',
      });
    }
    
    // Update fields
    task.title = title || task.title;
    task.description = description || task.description;
    task.status = status || task.status;
    task.priority = priority || task.priority;
    task.dueDate = dueDate || task.dueDate;
    task.assignedTo = assignedTo || task.assignedTo;
    task.reminderDate = reminderDate || task.reminderDate;
    
    await task.save();
    
    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      task,
    });
  } catch (error) {
    next(error);
  }
};

// Delete a task
export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }
    
    // Check if user is authorized
    if (task.createdBy.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this task',
      });
    }
    
    await task.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Reorder tasks
export const reorderTasks = async (req, res, next) => {
  try {
    const { tasks } = req.body;
    
    if (!Array.isArray(tasks)) {
      return res.status(400).json({
        success: false,
        message: 'Tasks must be an array',
      });
    }
    
    // Update positions in a bulk operation
    const bulkOps = tasks.map(task => ({
      updateOne: {
        filter: { _id: task.id },
        update: { position: task.position }
      }
    }));
    
    await Task.bulkWrite(bulkOps);
    
    res.status(200).json({
      success: true,
      message: 'Tasks reordered successfully',
    });
  } catch (error) {
    next(error);
  }
};