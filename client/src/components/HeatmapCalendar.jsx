import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS = ['S','M','T','W','T','F','S'];

const getIntensityColor = (intensity, dark) => {
  if (intensity === 0) return dark ? '#1f2937' : '#f3f4f6';
  if (intensity < 0.25) return '#3730a3';
  if (intensity < 0.5) return '#4f46e5';
  if (intensity < 0.75) return '#6366f1';
  return '#818cf8';
};

export default function HeatmapCalendar({ data = [], loading }) {
  const { dark } = useTheme();
  const [tooltip, setTooltip] = useState(null);

  const cells = useMemo(() => {
    const today = new Date();
    const result = [];
    const dataMap = {};
    data.forEach(d => { dataMap[d.date] = d; });

    // Go back 52 weeks
    for (let i = 364; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const entry = dataMap[dateStr];
      result.push({
        date: dateStr,
        dayOfWeek: d.getDay(),
        month: d.getMonth(),
        day: d.getDate(),
        intensity: entry ? entry.intensity : 0,
        completed: entry?.completed || 0,
        total: entry?.total || 0,
        label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      });
    }
    return result;
  }, [data]);

  // Group into weeks (columns of 7)
  const weeks = useMemo(() => {
    const ws = [];
    let week = [];
    // pad start
    const firstDay = cells[0]?.dayOfWeek || 0;
    for (let i = 0; i < firstDay; i++) week.push(null);
    cells.forEach(cell => {
      week.push(cell);
      if (week.length === 7) { ws.push(week); week = []; }
    });
    if (week.length) { while (week.length < 7) week.push(null); ws.push(week); }
    return ws;
  }, [cells]);

  return (
    <div className={`rounded-2xl border p-5 ${dark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-sm'}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold">Activity Heatmap</h3>
        <div className="flex items-center gap-2 text-xs font-body text-gray-400">
          <span>Less</span>
          {[0, 0.2, 0.5, 0.8, 1].map((v, i) => (
            <div key={i} className="w-3 h-3 rounded-sm" style={{ background: getIntensityColor(v, dark) }} />
          ))}
          <span>More</span>
        </div>
      </div>

      {loading ? (
        <div className={`h-32 rounded-xl animate-pulse ${dark ? 'bg-gray-800' : 'bg-gray-100'}`} />
      ) : (
        <div className="overflow-x-auto">
          <div className="relative inline-flex gap-1 min-w-full">
            {/* Day labels */}
            <div className="flex flex-col gap-1 mr-1 pt-5">
              {DAYS.map((d, i) => (
                <div key={i} className="h-3 text-xs text-gray-500 font-body leading-none flex items-center">
                  {i % 2 === 0 ? d : ''}
                </div>
              ))}
            </div>

            {/* Weeks */}
            <div className="flex gap-1">
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-1">
                  {/* Month label for first day of month */}
                  <div className="h-4 text-xs text-gray-400 font-body leading-none">
                    {week.find(c => c?.day === 1) ? MONTHS[week.find(c => c?.day === 1).month] : ''}
                  </div>
                  {week.map((cell, di) => (
                    <div
                      key={di}
                      className="w-3 h-3 rounded-sm heatmap-cell cursor-pointer relative"
                      style={{ background: cell ? getIntensityColor(cell.intensity, dark) : 'transparent' }}
                      onMouseEnter={(e) => cell && setTooltip({ ...cell, x: e.clientX, y: e.clientY })}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tooltip */}
      {tooltip && (
        <div
          className={`fixed z-50 px-3 py-2 rounded-xl text-xs font-body shadow-xl border pointer-events-none ${
            dark ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-white border-gray-200 text-gray-700'
          }`}
          style={{ left: tooltip.x + 12, top: tooltip.y - 40 }}
        >
          <p className="font-semibold">{tooltip.label}</p>
          <p className="text-gray-400">
            {tooltip.total > 0 ? `${tooltip.completed}/${tooltip.total} tasks · ${Math.round(tooltip.intensity * 100)}%` : 'No tasks'}
          </p>
        </div>
      )}
    </div>
  );
}
