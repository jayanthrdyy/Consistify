import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, GripVertical, CheckCircle, Circle, Pencil, Trash2, BookOpen, Dumbbell, Briefcase, User } from 'lucide-react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTheme } from '../context/ThemeContext';
import { taskService } from '../services/api';
import AddTaskModal from '../components/AddTaskModal';
import toast from 'react-hot-toast';

const CATEGORY_ICONS = { Study: BookOpen, Fitness: Dumbbell, Work: Briefcase, Personal: User };
const CATEGORY_COLORS = {
  Study: 'from-blue-500 to-indigo-500',
  Fitness: 'from-emerald-500 to-teal-500',
  Work: 'from-violet-500 to-purple-500',
  Personal: 'from-pink-500 to-rose-500',
};
const PRIORITY_COLORS = {
  High: 'bg-red-500/15 text-red-400 border-red-500/20',
  Medium: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  Low: 'bg-green-500/15 text-green-400 border-green-500/20',
};

function SortableTask({ task, dark, onToggle, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task._id });
  const Icon = CATEGORY_ICONS[task.category] || User;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 'auto',
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`flex items-center gap-3 p-4 rounded-2xl border transition-all group ${
        dark
          ? 'bg-gray-900 border-gray-800 hover:border-indigo-500/30'
          : 'bg-white border-gray-200 hover:border-indigo-200 shadow-sm'
      } ${task.completed ? 'opacity-60' : ''}`}
    >
      {/* Drag handle */}
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-gray-500 hover:text-gray-300 touch-none">
        <GripVertical size={16} />
      </div>

      {/* Toggle */}
      <button onClick={() => onToggle(task)} className="flex-shrink-0">
        {task.completed
          ? <CheckCircle size={20} className="text-emerald-400" />
          : <Circle size={20} className={dark ? 'text-gray-600 hover:text-indigo-400' : 'text-gray-300 hover:text-indigo-500'} />
        }
      </button>

      {/* Icon */}
      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${CATEGORY_COLORS[task.category]} flex items-center justify-center flex-shrink-0`}>
        <Icon size={14} className="text-white" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium font-body truncate ${task.completed ? 'line-through text-gray-400' : ''}`}>
          {task.title}
        </p>
        <p className={`text-xs font-body mt-0.5 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
          {task.category} · {task.goalHours}h goal
        </p>
      </div>

      {/* Priority */}
      <span className={`text-xs px-2 py-0.5 rounded-full border font-body flex-shrink-0 ${PRIORITY_COLORS[task.priority]}`}>
        {task.priority}
      </span>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onEdit(task)} className={`p-1.5 rounded-lg transition-colors ${dark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
          <Pencil size={13} />
        </button>
        <button onClick={() => onDelete(task._id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors">
          <Trash2 size={13} />
        </button>
      </div>
    </motion.div>
  );
}

export default function Tasks() {
  const { dark } = useTheme();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('All');
  const [filterPri, setFilterPri] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const load = async () => {
    try {
      const res = await taskService.getAll();
      setTasks(res.data);
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = tasks.filter(t => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterCat !== 'All' && t.category !== filterCat) return false;
    if (filterPri !== 'All' && t.priority !== filterPri) return false;
    if (filterStatus === 'Completed' && !t.completed) return false;
    if (filterStatus === 'Pending' && t.completed) return false;
    return true;
  });

  const handleToggle = async (task) => {
    const updated = !task.completed;
    setTasks(prev => prev.map(t => t._id === task._id ? { ...t, completed: updated } : t));
    try {
      await taskService.update(task._id, { completed: updated });
      toast.success(updated ? '✅ Task completed!' : 'Task marked pending');
    } catch {
      setTasks(prev => prev.map(t => t._id === task._id ? { ...t, completed: task.completed } : t));
      toast.error('Update failed');
    }
  };

  const handleDelete = async (id) => {
    setTasks(prev => prev.filter(t => t._id !== id));
    try {
      await taskService.delete(id);
      toast.success('Task deleted');
    } catch {
      load();
      toast.error('Delete failed');
    }
  };

  const handleDragEnd = async ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const oldIdx = tasks.findIndex(t => t._id === active.id);
    const newIdx = tasks.findIndex(t => t._id === over.id);
    const newOrder = arrayMove(tasks, oldIdx, newIdx);
    setTasks(newOrder);
    try {
      await taskService.reorder(newOrder.map((t, i) => ({ id: t._id, order: i })));
    } catch {
      toast.error('Reorder failed');
    }
  };

  const handleSaved = () => {
    setShowModal(false);
    setEditTask(null);
    load();
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const pct = tasks.length ? Math.round(completedCount / tasks.length * 100) : 0;

  const card = `rounded-2xl border p-5 ${dark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-sm'}`;

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold">Task Manager</h2>
          <p className={`text-sm font-body mt-0.5 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
            {completedCount}/{tasks.length} completed today · {pct}%
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { setEditTask(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold font-body shadow-lg shadow-indigo-500/25"
        >
          <Plus size={16} />
          Add Task
        </motion.button>
      </div>

      {/* Progress bar */}
      <div className={card}>
        <div className="flex justify-between text-xs font-body mb-2">
          <span className={dark ? 'text-gray-400' : 'text-gray-500'}>Daily Progress</span>
          <span className="text-indigo-400 font-semibold">{pct}%</span>
        </div>
        <div className={`h-2.5 rounded-full ${dark ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <motion.div
            className="h-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
      </div>

      {/* Filters */}
      <div className={card}>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search tasks..."
              className={`w-full pl-9 pr-4 py-2 rounded-xl border text-sm font-body outline-none ${
                dark ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500 focus:border-indigo-500' : 'bg-gray-50 border-gray-200 focus:border-indigo-400'
              }`}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['All', 'Study', 'Fitness', 'Work', 'Personal'].map(c => (
              <button key={c} onClick={() => setFilterCat(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-body border transition-all ${
                  filterCat === c
                    ? 'bg-indigo-500 text-white border-indigo-500'
                    : dark ? 'border-gray-700 text-gray-400 hover:border-indigo-500/50' : 'border-gray-200 text-gray-500 hover:border-indigo-300'
                }`}>{c}</button>
            ))}
          </div>
          <div className="flex gap-2">
            {['All', 'Pending', 'Completed'].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-body border transition-all ${
                  filterStatus === s
                    ? 'bg-violet-500 text-white border-violet-500'
                    : dark ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'
                }`}>{s}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Task list */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4].map(i => (
            <div key={i} className={`h-20 rounded-2xl animate-pulse ${dark ? 'bg-gray-900' : 'bg-gray-100'}`} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className={`${card} text-center py-12`}>
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={28} className="text-indigo-400" />
          </div>
          <p className={`font-display font-semibold ${dark ? 'text-gray-300' : 'text-gray-700'}`}>No tasks found</p>
          <p className={`text-sm font-body mt-1 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
            {tasks.length === 0 ? 'Add your first task to get started' : 'Try adjusting your filters'}
          </p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={filtered.map(t => t._id)} strategy={verticalListSortingStrategy}>
            <AnimatePresence>
              <div className="space-y-2">
                {filtered.map(task => (
                  <SortableTask
                    key={task._id}
                    task={task}
                    dark={dark}
                    onToggle={handleToggle}
                    onEdit={(t) => { setEditTask(t); setShowModal(true); }}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </AnimatePresence>
          </SortableContext>
        </DndContext>
      )}

      <AnimatePresence>
        {showModal && (
          <AddTaskModal
            task={editTask}
            onClose={() => { setShowModal(false); setEditTask(null); }}
            onSaved={handleSaved}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
