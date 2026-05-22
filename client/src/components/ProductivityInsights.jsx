import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Calendar, Sparkles, Star, AlertCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ProductivityInsights({ insights, loading }) {
  const { dark } = useTheme();

  const card = `rounded-2xl border p-5 ${dark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-sm'}`;

  if (loading) return (
    <div className={card}>
      <div className="space-y-4">
        {[1,2,3].map(i => <div key={i} className={`h-16 rounded-xl animate-pulse ${dark ? 'bg-gray-800' : 'bg-gray-100'}`} />)}
      </div>
    </div>
  );

  const items = insights ? [
    {
      icon: Calendar,
      color: 'from-indigo-500 to-blue-500',
      label: 'Most Productive Day',
      value: insights.mostProductiveDay,
      detail: `${insights.mostProductiveDayPct}% avg completion`,
      bg: 'bg-indigo-500/10',
    },
    {
      icon: Star,
      color: 'from-emerald-500 to-teal-500',
      label: 'Strongest Habit',
      value: insights.strongestCategory,
      detail: `${insights.strongestCategoryPct}% consistency`,
      bg: 'bg-emerald-500/10',
    },
    {
      icon: AlertCircle,
      color: 'from-orange-500 to-red-500',
      label: 'Needs Attention',
      value: insights.weakestCategory,
      detail: `${insights.weakestCategoryPct}% consistency`,
      bg: 'bg-orange-500/10',
    },
    {
      icon: TrendingUp,
      color: 'from-violet-500 to-purple-500',
      label: 'Avg Completion Rate',
      value: `${insights.avgCompletionRate}%`,
      detail: 'All-time average',
      bg: 'bg-violet-500/10',
    },
  ] : [];

  return (
    <div className={card}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
          <Sparkles size={14} className="text-white" />
        </div>
        <h3 className="font-display font-semibold">Productivity Insights</h3>
      </div>

      {!insights ? (
        <div className="text-center py-8">
          <p className={`text-sm font-body ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
            Complete some tasks to generate insights
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {items.map(({ icon: Icon, color, label, value, detail, bg }) => (
            <motion.div
              key={label}
              whileHover={{ scale: 1.02 }}
              className={`p-4 rounded-xl ${dark ? 'bg-gray-800/60' : 'bg-gray-50'} border ${dark ? 'border-gray-700/50' : 'border-gray-100'}`}
            >
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
                <Icon size={15} className="text-white" />
              </div>
              <p className={`text-xs font-body ${dark ? 'text-gray-500' : 'text-gray-400'}`}>{label}</p>
              <p className="font-display font-bold text-base mt-0.5">{value}</p>
              <p className={`text-xs font-body mt-0.5 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>{detail}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
