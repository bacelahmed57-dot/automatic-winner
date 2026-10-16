import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common/Avatar';
import {
  Home,
  User,
  Bookmark,
  Sparkles,
  ShieldCheck,
  PlusCircle,
} from 'lucide-react';

export const Sidebar = ({ onOpenCreatePost }) => {
  const { user } = useAuth();

  const navItems = [
    { label: 'Feed & Timeline', path: '/', icon: Home },
    { label: 'My Profile', path: '/profile', icon: User },
    { label: 'Saved Bookmarks', path: '/bookmarks', icon: Bookmark },
  ];

  return (
    <aside className="w-64 shrink-0 hidden lg:block">
      <div className="sticky top-20 space-y-6">
        {/* User Mini Profile Card */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <Avatar src={user?.photo} alt={user?.name} size="lg" />
          <div className="overflow-hidden">
            <Link
              to="/profile"
              className="font-bold text-slate-900 hover:text-blue-600 transition-colors text-sm truncate block"
            >
              {user?.name || 'User'}
            </Link>
            <p className="text-xs text-slate-400 truncate">@{user?.username || 'user'}</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Create Post Button */}
        {onOpenCreatePost && (
          <button
            onClick={onOpenCreatePost}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-2xl shadow-md shadow-blue-500/20 active:scale-98 transition-all cursor-pointer"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Create New Post</span>
          </button>
        )}

        {/* Route Info Badge */}
        <div className="p-4 bg-linear-to-br from-indigo-50/50 to-blue-50/50 rounded-2xl border border-indigo-100/80">
          <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Route Academy</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Connected to official Route Posts backend. Full CRUD for posts and comments enabled.
          </p>
        </div>
      </div>
    </aside>
  );
};
