import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { RightSidebar } from './RightSidebar';
import { CreatePostModal } from '../posts/CreatePostModal';
import { ChangePasswordModal } from '../common/ChangePasswordModal';
import { Home, User, Bookmark, PlusCircle } from 'lucide-react';

export const Layout = () => {
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        onOpenCreatePost={() => setCreatePostOpen(true)}
        onOpenChangePassword={() => setChangePasswordOpen(true)}
      />

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-center gap-6">
          {/* Left Navigation Sidebar */}
          <Sidebar onOpenCreatePost={() => setCreatePostOpen(true)} />

          {/* Main Content Area */}
          <main className="flex-1 max-w-2xl min-w-0 pb-16 lg:pb-0">
            <Outlet context={{ openCreatePost: () => setCreatePostOpen(true) }} />
          </main>

          {/* Right Info / Suggestions Sidebar */}
          <RightSidebar />
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 lg:hidden px-4 py-2 flex items-center justify-around">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 p-2 rounded-xl text-xs font-semibold ${
              isActive ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
            }`
          }
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </NavLink>

        <button
          onClick={() => setCreatePostOpen(true)}
          className="flex flex-col items-center gap-1 p-2 text-blue-600 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-full bg-linear-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-center -mt-5 shadow-lg shadow-blue-500/30">
            <PlusCircle className="w-6 h-6" />
          </div>
        </button>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 p-2 rounded-xl text-xs font-semibold ${
              isActive ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
            }`
          }
        >
          <User className="w-5 h-5" />
          <span>Profile</span>
        </NavLink>

        <NavLink
          to="/bookmarks"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 p-2 rounded-xl text-xs font-semibold ${
              isActive ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
            }`
          }
        >
          <Bookmark className="w-5 h-5" />
          <span>Saved</span>
        </NavLink>
      </nav>

      {/* Global Modals */}
      <CreatePostModal
        isOpen={createPostOpen}
        onClose={() => setCreatePostOpen(false)}
        onPostCreated={() => {
          // Trigger custom event or page reload / state refresh
          window.dispatchEvent(new CustomEvent('post-created'));
        }}
      />

      <ChangePasswordModal
        isOpen={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
      />
    </div>
  );
};
