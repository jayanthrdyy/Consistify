import { Menu, Sun, Moon, Bell } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/tasks': 'Task Manager',
  '/analytics': 'Analytics',
};

export default function Navbar({ onMenuClick }) {
  const { dark, toggle } = useTheme();
  const { pathname } = useLocation();
  const title = pageTitles[pathname] || 'Consistify';

  return (
    <header className={`h-16 flex items-center justify-between px-4 md:px-6 border-b sticky top-0 z-10 backdrop-blur-md ${
      dark ? 'bg-gray-950/80 border-gray-800' : 'bg-white/80 border-gray-200'
    }`}>
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className={`lg:hidden p-2 rounded-lg transition-colors ${dark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
        >
          <Menu size={20} className="text-gray-400" />
        </button>
        <h1 className="font-display font-bold text-lg">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={toggle}
          className={`p-2 rounded-xl transition-all duration-200 ${
            dark ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' : 'bg-gray-100 text-indigo-600 hover:bg-gray-200'
          }`}
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </motion.button>
      </div>
    </header>
  );
}
