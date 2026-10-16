import React, { useEffect, useState } from 'react';
import { getFollowSuggestions } from '../../api/auth';
import { Avatar } from '../common/Avatar';
import { Users, Sparkles, TrendingUp, Heart } from 'lucide-react';
import toast from 'react-hot-toast';

export const RightSidebar = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const res = await getFollowSuggestions(5);
        if (res.data?.users) {
          setSuggestions(res.data.users);
        } else if (res.data?.suggestions) {
          setSuggestions(res.data.suggestions);
        }
      } catch (err) {
        console.error('Error fetching suggestions:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, []);

  return (
    <aside className="w-80 shrink-0 hidden xl:block">
      <div className="sticky top-20 space-y-6">
        {/* Follow Suggestions Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-900">Suggested For You</h3>
          </div>

          {isLoading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-200 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <div className="h-3 bg-slate-200 rounded-sm w-3/4" />
                    <div className="h-2 bg-slate-200 rounded-sm w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : suggestions.length > 0 ? (
            <div className="space-y-3.5">
              {suggestions.slice(0, 5).map((user) => (
                <div key={user._id || user.id} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <Avatar src={user.photo} alt={user.name} size="sm" />
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-800 truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">@{user.username}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toast.success(`Followed @${user.username}`)}
                    className="text-xs font-semibold px-3 py-1.5 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded-full transition-all cursor-pointer"
                  >
                    Follow
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400">No new suggestions at the moment.</p>
          )}
        </div>

        {/* Community & Learning Card */}
        <div className="bg-linear-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-blue-500/20 rounded-full blur-xl" />
          <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4" />
            <span>Route Academy</span>
          </div>
          <h4 className="font-bold text-base mb-1.5">Social Media Project</h4>
          <p className="text-xs text-slate-300 leading-relaxed mb-4">
            Engineered with React 19, Tailwind CSS, and official Route Academy APIs.
          </p>
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>Route Academy Cohort 2026</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
