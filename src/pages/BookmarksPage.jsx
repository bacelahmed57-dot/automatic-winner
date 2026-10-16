import React, { useState, useEffect } from 'react';
import { getBookmarks } from '../api/auth';
import { PostCard } from '../components/posts/PostCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Bookmark, Sparkles } from 'lucide-react';

export const BookmarksPage = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const res = await getBookmarks();
        if (res.data?.bookmarks) {
          setBookmarks(res.data.bookmarks);
        } else if (res.data?.posts) {
          setBookmarks(res.data.posts);
        }
      } catch (err) {
        console.error('Error fetching bookmarks:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookmarks();
  }, []);

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
          <Bookmark className="w-5 h-5 fill-amber-500" />
        </div>
        <div>
          <h2 className="font-bold text-base text-slate-800">Saved Bookmarks</h2>
          <p className="text-xs text-slate-400">Posts you saved to read later</p>
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner text="Loading saved bookmarks..." />
      ) : bookmarks.length > 0 ? (
        <div className="space-y-4">
          {bookmarks.map((post) => (
            <PostCard key={post._id || post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-3">
          <Sparkles className="w-8 h-8 text-amber-500 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">No saved posts yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Click the save icon on any post in your feed to bookmark it for later!
          </p>
        </div>
      )}
    </div>
  );
};
