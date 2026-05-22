import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, Trophy, Target, TrendingUp, CheckCircle, Circle, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { taskService, analyticsService } from '../services/api';
import HeatmapCalendar from '../components/HeatmapCalendar';
import ProductivityInsights from '../components/ProductivityInsights';
import toast from 'react-hot-toast';

const useClock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
};

const getGreeting = (hour) => {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const card = (dark) => `rounded-2xl border p-5 ${dark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-sm'}`;

export default function Dashboard() {
  const { user } = useAuth();
  const { dark } = useTheme();
  const time = useClock();
  const [analytics, setAnalytics] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [aRes, tRes] = await Promise.all([analyticsService.get(), taskService.getAll()]);
        setAnalytics(aRes.data);
        setTasks(tRes.data);
      } catch (err) {
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const toggleTask = async (task) => {
    const updated = !task.completed;
    setTasks(prev => prev.map(t => t._id === task._id ? { ...t, completed: updated } : t));
    try {
      await taskService.update(task._id, { completed: updated });
      const aRes = await analyticsService.get();
      setAnalytics(aRes.data);
    } catch {
      setTasks(prev => prev.map(t => t._id === task._id ? { ...t, completed: task.completed } : t));
      toast.error('Update failed');
    }
  };

  const todayTasks = tasks.slice(0, 5);
  const greeting = getGreeting(time.getHours());

  const statCards = [
    { label: 'Current Streak', value: `${analytics?.streak || 0}d`, icon: Flame, color: 'from-orange-500 to-red-500', glow: 'shadow-orange-500/20' },
    { label: 'Longest Streak', value: `${analytics?.longestStreak || 0}d`, icon: Trophy, color: 'from-yellow-500 to-amber-500', glow: 'shadow-yellow-500/20' },
    { label: "Today's Progress", value: `${analytics?.dailyCompletionPct || 0}%`, icon: Target, color: 'from-indigo-500 to-violet-500', glow: 'shadow-indigo-500/20' },
    { label: 'Consistency Rate', value: `${analytics?.completionRate || 0}%`, icon: TrendingUp, color: 'from-emerald-500 to-teal-500', glow: 'shadow-emerald-500/20' },
  ];

  const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div variants={item} className={`rounded-2xl border p-6 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 20% 80%, white 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-white/70 text-sm font-body mb-1">{greeting},</p>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-white">{user?.name} 👋</h2>
            <p className="text-white/60 text-sm font-body mt-2">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="text-right">
            <div className="font-display text-3xl md:text-4xl font-bold text-white">
              {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            {analytics?.streak > 0 && (
              <div className="flex items-center justify-end gap-1.5 mt-2">
                <Flame size={16} className="text-orange-300" />
                <span className="text-orange-200 text-sm font-body">{analytics.streak} day streak!</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, glow }) => (
          <motion.div key={label} variants={item} className={card(dark)}>
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg ${glow} mb-3`}>
              <Icon size={18} className="text-white" />
            </div>
            <p className={`text-sm font-body ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{label}</p>
            <p className="font-display text-2xl font-bold mt-0.5">{loading ? '—' : value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Today's tasks */}
        <motion.div variants={item} className={`lg:col-span-1 ${card(dark)}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold">Today's Tasks</h3>
            <span className={`text-xs px-2 py-1 rounded-full font-body ${dark ? 'bg-indigo-500/15 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>
              {tasks.filter(t => t.completed).length}/{tasks.length}
            </span>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className={`h-12 rounded-xl animate-pulse ${dark ? 'bg-gray-800' : 'bg-gray-100'}`} />)}
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-8">
              <Zap size={32} className="text-gray-400 mx-auto mb-2" />
              <p className={`text-sm font-body ${dark ? 'text-gray-500' : 'text-gray-400'}`}>No tasks yet. Add some!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {todayTasks.map(task => (
                <motion.div
                  key={task._id}
                  whileHover={{ x: 2 }}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                    dark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => toggleTask(task)}
                >
                  {task.completed
                    ? <CheckCircle size={18} className="text-emerald-400 flex-shrink-0" />
                    : <Circle size={18} className="text-gray-400 flex-shrink-0" />
                  }
                  <span className={`text-sm font-body flex-1 truncate ${task.completed ? 'line-through text-gray-400' : ''}`}>
                    {task.title}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-body ${
                    task.priority === 'High' ? 'bg-red-500/15 text-red-400' :
                    task.priority === 'Medium' ? 'bg-yellow-500/15 text-yellow-400' :
                    'bg-green-500/15 text-green-400'
                  }`}>{task.priority}</span>
                </motion.div>
              ))}
              {tasks.length > 5 && (
                <p className={`text-xs text-center font-body pt-1 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
                  +{tasks.length - 5} more tasks
                </p>
              )}
            </div>
          )}

          {/* Progress bar */}
          {tasks.length > 0 && (
            <div className="mt-4">
              <div className={`h-2 rounded-full ${dark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <motion.div
                  className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${analytics?.dailyCompletionPct || 0}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
              <p className={`text-xs mt-1.5 font-body text-right ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
                {analytics?.dailyCompletionPct || 0}% complete
              </p>
            </div>
          )}
        </motion.div>

        {/* Insights */}
        <motion.div variants={item} className="lg:col-span-2">
          <ProductivityInsights insights={analytics?.insights} loading={loading} />
        </motion.div>
      </div>

      {/* Heatmap */}
      <motion.div variants={item}>
        <HeatmapCalendar data={analytics?.heatmap || []} loading={loading} />
      </motion.div>
    </motion.div>
  );
}
