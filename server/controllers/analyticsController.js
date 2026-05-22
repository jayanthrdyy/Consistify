const Task = require('../models/Task');
const Analytics = require('../models/Analytics');

const getTodayStr = () => new Date().toISOString().split('T')[0];

exports.getAnalytics = async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.userId });
    const analytics = await Analytics.findOne({ userId: req.userId }) || { streak: 0, longestStreak: 0, completionRate: 0 };
    const todayStr = getTodayStr();

    // Today's stats
    const todayTasks = tasks.filter(t => t.history.some(h => h.date === todayStr));
    const todayCompleted = todayTasks.filter(t => t.history.find(h => h.date === todayStr)?.completed).length;
    const dailyCompletionPct = todayTasks.length ? Math.round((todayCompleted / todayTasks.length) * 100) : 0;

    // All unique dates
    const allDates = new Set();
    tasks.forEach(t => t.history.forEach(h => allDates.add(h.date)));
    const sortedDates = [...allDates].sort();

    // Heatmap data (last 365 days)
    const heatmap = sortedDates.map(date => {
      const dayTasks = tasks.filter(t => t.history.some(h => h.date === date));
      const dayCompleted = dayTasks.filter(t => t.history.find(h => h.date === date)?.completed).length;
      const intensity = dayTasks.length ? dayCompleted / dayTasks.length : 0;
      return { date, completed: dayCompleted, total: dayTasks.length, intensity };
    });

    // Weekly data (last 7 days)
    const weekly = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayTasks = tasks.filter(t => t.history.some(h => h.date === dateStr));
      const dayCompleted = dayTasks.filter(t => t.history.find(h => h.date === dateStr)?.completed).length;
      weekly.push({ date: dateStr, day: dayName, completed: dayCompleted, total: dayTasks.length, pct: dayTasks.length ? Math.round(dayCompleted / dayTasks.length * 100) : 0 });
    }

    // Monthly data (last 30 days grouped by week)
    const monthly = [];
    for (let w = 3; w >= 0; w--) {
      let weekCompleted = 0, weekTotal = 0;
      for (let d = 0; d < 7; d++) {
        const day = new Date();
        day.setDate(day.getDate() - (w * 7 + d));
        const dateStr = day.toISOString().split('T')[0];
        const dayTasks = tasks.filter(t => t.history.some(h => h.date === dateStr));
        weekCompleted += dayTasks.filter(t => t.history.find(h => h.date === dateStr)?.completed).length;
        weekTotal += dayTasks.length;
      }
      monthly.push({ week: `Week ${4 - w}`, completed: weekCompleted, total: weekTotal, pct: weekTotal ? Math.round(weekCompleted / weekTotal * 100) : 0 });
    }

    // Category consistency
    const categories = ['Study', 'Fitness', 'Work', 'Personal'];
    const categoryStats = categories.map(cat => {
      const catTasks = tasks.filter(t => t.category === cat);
      if (!catTasks.length) return { category: cat, consistency: 0, total: 0 };
      let totalEntries = 0, completedEntries = 0;
      catTasks.forEach(t => {
        t.history.forEach(h => {
          totalEntries++;
          if (h.completed) completedEntries++;
        });
      });
      return { category: cat, consistency: totalEntries ? Math.round(completedEntries / totalEntries * 100) : 0, total: catTasks.length };
    });

    // Pie chart data
    let totalCompleted = 0, totalMissed = 0;
    tasks.forEach(t => {
      t.history.forEach(h => {
        if (h.completed) totalCompleted++;
        else totalMissed++;
      });
    });

    // Insights
    const dayCompletions = { Mon: [], Tue: [], Wed: [], Thu: [], Fri: [], Sat: [], Sun: [] };
    sortedDates.forEach(dateStr => {
      const d = new Date(dateStr);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayTasks = tasks.filter(t => t.history.some(h => h.date === dateStr));
      const pct = dayTasks.length ? dayTasks.filter(t => t.history.find(h => h.date === dateStr)?.completed).length / dayTasks.length * 100 : 0;
      if (dayCompletions[dayName]) dayCompletions[dayName].push(pct);
    });
    const dayAvgs = Object.entries(dayCompletions).map(([day, vals]) => ({ day, avg: vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0 }));
    const mostProductiveDay = dayAvgs.sort((a, b) => b.avg - a.avg)[0];
    const strongestCategory = [...categoryStats].sort((a, b) => b.consistency - a.consistency)[0];
    const weakestCategory = [...categoryStats].filter(c => c.total > 0).sort((a, b) => a.consistency - b.consistency)[0];

    res.json({
      streak: analytics.streak,
      longestStreak: analytics.longestStreak,
      completionRate: analytics.completionRate,
      dailyCompletionPct,
      todayCompleted,
      todayTotal: todayTasks.length,
      heatmap,
      weekly,
      monthly,
      categoryStats,
      pie: { completed: totalCompleted, missed: totalMissed },
      insights: {
        mostProductiveDay: mostProductiveDay?.day || 'N/A',
        mostProductiveDayPct: Math.round(mostProductiveDay?.avg || 0),
        strongestCategory: strongestCategory?.category || 'N/A',
        strongestCategoryPct: strongestCategory?.consistency || 0,
        weakestCategory: weakestCategory?.category || 'N/A',
        weakestCategoryPct: weakestCategory?.consistency || 0,
        avgCompletionRate: analytics.completionRate
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getStreaks = async (req, res) => {
  try {
    const analytics = await Analytics.findOne({ userId: req.userId });
    res.json(analytics || { streak: 0, longestStreak: 0, completionRate: 0 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
