const Task = require('../models/Task');
const Analytics = require('../models/Analytics');

const getTodayStr = () => new Date().toISOString().split('T')[0];

const updateAnalytics = async (userId) => {
  const tasks = await Task.find({ userId });
  if (!tasks.length) return;

  // Collect all unique dates from history
  const allDates = new Set();
  tasks.forEach(t => t.history.forEach(h => allDates.add(h.date)));
  const sortedDates = [...allDates].sort();

  let streak = 0, longestStreak = 0, currentStreak = 0;
  let completedDays = 0;

  sortedDates.forEach(date => {
    const dayTasks = tasks.filter(t => t.history.some(h => h.date === date));
    const dayCompleted = dayTasks.every(t => t.history.find(h => h.date === date)?.completed);
    if (dayCompleted && dayTasks.length > 0) {
      completedDays++;
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  });

  // Check if today breaks or continues streak
  const todayStr = getTodayStr();
  const todayTasks = tasks.filter(t => t.history.some(h => h.date === todayStr));
  if (todayTasks.length > 0) {
    const todayAllDone = todayTasks.every(t => t.history.find(h => h.date === todayStr)?.completed);
    streak = todayAllDone ? currentStreak : 0;
  } else {
    streak = currentStreak;
  }

  const totalDays = sortedDates.length || 1;
  const completionRate = Math.round((completedDays / totalDays) * 100);

  await Analytics.findOneAndUpdate(
    { userId },
    { streak, longestStreak, completionRate, lastActiveDate: todayStr, updatedAt: new Date() },
    { upsert: true, new: true }
  );
};

exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.userId }).sort({ order: 1, createdAt: -1 });
    const todayStr = getTodayStr();

    // Add today's history entry if missing
    for (const task of tasks) {
      const hasToday = task.history.some(h => h.date === todayStr);
      if (!hasToday) {
        task.history.push({ date: todayStr, completed: false });
        await task.save();
      }
    }

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createTask = async (req, res) => {
  try {
    const { title, category, priority, goalHours } = req.body;
    const todayStr = getTodayStr();
    const count = await Task.countDocuments({ userId: req.userId });
    const task = new Task({
      userId: req.userId, title, category, priority, goalHours,
      order: count,
      history: [{ date: todayStr, completed: false }]
    });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.userId });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const { title, category, priority, goalHours, completed, order } = req.body;
    const todayStr = getTodayStr();

    if (title !== undefined) task.title = title;
    if (category !== undefined) task.category = category;
    if (priority !== undefined) task.priority = priority;
    if (goalHours !== undefined) task.goalHours = goalHours;
    if (order !== undefined) task.order = order;

    if (completed !== undefined) {
      task.completed = completed;
      // Update today's history
      const todayHistory = task.history.find(h => h.date === todayStr);
      if (todayHistory) {
        todayHistory.completed = completed;
      } else {
        task.history.push({ date: todayStr, completed });
      }
      // Track completion dates
      if (completed) {
        const alreadyCompleted = task.completedDates.some(
          d => d.toISOString().split('T')[0] === todayStr
        );
        if (!alreadyCompleted) task.completedDates.push(new Date());
      } else {
        task.completedDates = task.completedDates.filter(
          d => d.toISOString().split('T')[0] !== todayStr
        );
      }
    }

    await task.save();
    await updateAnalytics(req.userId);
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.reorderTasks = async (req, res) => {
  try {
    const { tasks } = req.body; // [{ id, order }]
    await Promise.all(tasks.map(({ id, order }) =>
      Task.findOneAndUpdate({ _id: id, userId: req.userId }, { order })
    ));
    res.json({ message: 'Reordered' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
