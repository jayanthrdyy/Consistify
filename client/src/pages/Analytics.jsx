import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend
} from 'recharts';
import { analyticsService } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import HeatmapCalendar from '../components/HeatmapCalendar';
import toast from 'react-hot-toast';

const COLORS = ['#6366f1', '#f43f5e', '#10b981', '#f59e0b'];
const card = (dark) => `rounded-2xl border p-5 ${dark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-sm'}`;

const CustomTooltip = ({ active, payload, label, dark }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={`p-3 rounded-xl border shadow-xl ${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <p className="text-xs font-body text-gray-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-semibold font-body" style={{ color: p.color }}>
          {p.name}: {p.value}{p.name === 'Completion' ? '%' : ''}
        </p>
      ))}
    </div>
  );
};

export default function Analytics() {
  const { dark } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsService.get()
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  const axisStyle = { fill: dark ? '#6b7280' : '#9ca3af', fontSize: 11, fontFamily: 'DM Sans' };

  const pieData = data ? [
    { name: 'Completed', value: data.pie.completed },
    { name: 'Missed', value: data.pie.missed },
  ] : [];

  const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="max-w-6xl mx-auto space-y-6">
      <motion.div variants={item}>
        <h2 className="font-display text-2xl font-bold">Analytics</h2>
        <p className={`text-sm font-body mt-0.5 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
          Deep dive into your productivity patterns
        </p>
      </motion.div>

      {/* Top stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Current Streak', value: `${data?.streak || 0}d`, color: 'text-orange-400' },
          { label: 'Longest Streak', value: `${data?.longestStreak || 0}d`, color: 'text-yellow-400' },
          { label: 'Overall Rate', value: `${data?.completionRate || 0}%`, color: 'text-indigo-400' },
        ].map(s => (
          <motion.div key={s.label} variants={item} className={card(dark)}>
            <p className={`text-xs font-body ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{s.label}</p>
            <p className={`font-display text-2xl font-bold mt-1 ${s.color}`}>
              {loading ? '—' : s.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Pie + Weekly */}
      <div className="grid md:grid-cols-2 gap-6">
        <motion.div variants={item} className={card(dark)}>
          <h3 className="font-display font-semibold mb-4">Completed vs Missed</h3>
          {loading ? (
            <div className={`h-48 rounded-xl animate-pulse ${dark ? 'bg-gray-800' : 'bg-gray-100'}`} />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={['#6366f1', '#f43f5e'][i]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: dark ? '#1f2937' : '#fff', border: 'none', borderRadius: 12, fontFamily: 'DM Sans' }} />
                <Legend formatter={(v) => <span style={{ color: dark ? '#d1d5db' : '#374151', fontFamily: 'DM Sans', fontSize: 12 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        <motion.div variants={item} className={card(dark)}>
          <h3 className="font-display font-semibold mb-4">Weekly Overview</h3>
          {loading ? (
            <div className={`h-48 rounded-xl animate-pulse ${dark ? 'bg-gray-800' : 'bg-gray-100'}`} />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data?.weekly || []} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke={dark ? '#374151' : '#f3f4f6'} />
                <XAxis dataKey="day" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis tick={axisStyle} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip dark={dark} />} />
                <Bar dataKey="pct" name="Completion" fill="#6366f1" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      {/* Monthly chart */}
      <motion.div variants={item} className={card(dark)}>
        <h3 className="font-display font-semibold mb-4">Monthly Productivity</h3>
        {loading ? (
          <div className={`h-48 rounded-xl animate-pulse ${dark ? 'bg-gray-800' : 'bg-gray-100'}`} />
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data?.monthly || []}>
              <CartesianGrid strokeDasharray="3 3" stroke={dark ? '#374151' : '#f3f4f6'} />
              <XAxis dataKey="week" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip dark={dark} />} />
              <Line type="monotone" dataKey="pct" name="Completion" stroke="#8b5cf6" strokeWidth={2.5} dot={{ fill: '#8b5cf6', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* Category table */}
      <motion.div variants={item} className={card(dark)}>
        <h3 className="font-display font-semibold mb-4">Category Consistency</h3>
        {loading ? (
          <div className="space-y-3">
            {[1,2,3,4].map(i => <div key={i} className={`h-10 rounded-lg animate-pulse ${dark ? 'bg-gray-800' : 'bg-gray-100'}`} />)}
          </div>
        ) : (
          <div className="space-y-3">
            {(data?.categoryStats || []).map(({ category, consistency, total }) => (
              <div key={category} className="flex items-center gap-4">
                <span className={`text-sm font-body w-20 flex-shrink-0 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>{category}</span>
                <div className={`flex-1 h-2.5 rounded-full ${dark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <motion.div
                    className="h-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${consistency}%` }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  />
                </div>
                <span className={`text-sm font-display font-bold w-12 text-right ${consistency >= 70 ? 'text-emerald-400' : consistency >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {consistency}%
                </span>
                <span className={`text-xs font-body ${dark ? 'text-gray-500' : 'text-gray-400'}`}>{total} tasks</span>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Heatmap */}
      <motion.div variants={item}>
        <HeatmapCalendar data={data?.heatmap || []} loading={loading} />
      </motion.div>
    </motion.div>
  );
}
