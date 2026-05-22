import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, BookOpen, Dumbbell, Briefcase, User, Clock } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { taskService } from '../services/api';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { label: 'Study', icon: BookOpen, color: 'from-blue-500 to-indigo-500' },
  { label: 'Fitness', icon: Dumbbell, color: 'from-emerald-500 to-teal-500' },
  { label: 'Work', icon: Briefcase, color: 'from-violet-500 to-purple-500' },
  { label: 'Personal', icon: User, color: 'from-pink-500 to-rose-500' },
];
const PRIORITIES = ['High', 'Medium', 'Low'];
const PRIORITY_COLORS = { High: 'border-red-500 bg-red-500/10 text-red-400', Medium: 'border-yellow-500 bg-yellow-500/10 text-yellow-400', Low: 'border-green-500 bg-green-500/10 text-green-400' };

export default function AddTaskModal({ task, onClose, onSaved }) {
  const { dark } = useTheme();
  const [title, setTitle] = useState(task?.title || '');
  const [category, setCategory] = useState(task?.category || 'Personal');
  const [priority, setPriority] = useState(task?.priority || 'Medium');
  const [goalHours, setGoalHours] = useState(task?.goalHours || 1);
  const [loading, setLoading] = useState(false);

  const isEdit = !!task;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return toast.error('Task title required');
    setLoading(true);
    try {
      if (isEdit) {
        await taskService.update(task._id, { title, category, priority, goalHours });
        toast.success('Task updated');
      } else {
        await taskService.create({ title, category, priority, goalHours });
        toast.success('Task created 🎯');
      }
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className={`relative w-full max-w-md rounded-2xl border shadow-2xl ${
          dark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="font-display font-bold text-lg">{isEdit ? 'Edit Task' : 'New Task'}</h2>
          <button onClick={onClose} className={`p-1.5 rounded-lg ${dark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className={`block text-sm font-medium mb-1.5 font-body ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Task Title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="What do you want to accomplish?"
              className={`w-full px-4 py-3 rounded-xl border text-sm font-body outline-none ${
                dark ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500 focus:border-indigo-500' : 'bg-gray-50 border-gray-200 focus:border-indigo-500'
              } focus:ring-2 focus:ring-indigo-500/20`}
              required
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 font-body ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Category</label>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map(({ label, icon: Icon, color }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setCategory(label)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-body transition-all ${
                    category === label
                      ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                      : dark ? 'border-gray-700 text-gray-400 hover:border-gray-600' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center`}>
                    <Icon size={13} className="text-white" />
                  </div>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 font-body ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Priority</label>
            <div className="flex gap-2">
              {PRIORITIES.map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`flex-1 py-2 rounded-xl border text-sm font-body transition-all ${
                    priority === p ? PRIORITY_COLORS[p] : dark ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1.5 font-body ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
              <span className="flex items-center gap-1.5"><Clock size={14} /> Goal Hours</span>
            </label>
            <input
              type="number"
              value={goalHours}
              onChange={e => setGoalHours(Number(e.target.value))}
              min={0.5}
              max={24}
              step={0.5}
              className={`w-full px-4 py-3 rounded-xl border text-sm font-body outline-none ${
                dark ? 'bg-gray-800 border-gray-700 text-gray-100 focus:border-indigo-500' : 'bg-gray-50 border-gray-200 focus:border-indigo-500'
              } focus:ring-2 focus:ring-indigo-500/20`}
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className={`flex-1 py-3 rounded-xl border text-sm font-body font-medium transition-colors ${
                dark ? 'border-gray-700 text-gray-400 hover:bg-gray-800' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              Cancel
            </button>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold font-body shadow-lg shadow-indigo-500/25 disabled:opacity-60"
            >
              {loading ? 'Saving...' : isEdit ? 'Update Task' : 'Create Task'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
