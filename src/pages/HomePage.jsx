import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { getAllPosts, getFeedPosts, deletePost } from '../api/posts';
import { useAuth } from '../context/AuthContext';
import { PostCard } from '../components/posts/PostCard';
import { EditPostModal } from '../components/posts/EditPostModal';
import { DeleteConfirmModal } from '../components/posts/DeleteConfirmModal';
import { Avatar } from '../components/common/Avatar';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Image as ImageIcon, Sparkles, RefreshCw, Layers, Globe } from 'lucide-react';
import toast from 'react-hot-toast';

export const HomePage = () => {
  const { user } = useAuth();
  const outletContext = useOutletContext();
  const openCreatePost = outletContext?.openCreatePost;

  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'feed'
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Modals
  const [editingPost, setEditingPost] = useState(null);
  const [deletingPost, setDeletingPost] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchPosts = useCallback(
    async (pageToLoad = 1, append = false) => {
      if (pageToLoad === 1) setIsLoading(true);
      else setIsLoadingMore(true);

      try {
        let res;
        if (activeTab === 'feed') {
          res = await getFeedPosts('all', pageToLoad, 10);
        } else {
          res = await getAllPosts(pageToLoad, 10);
        }

        const fetchedPosts = res.data?.posts || [];
        const pagination = res.meta?.pagination;

        if (append) {
          setPosts((prev) => [...prev, ...fetchedPosts]);
        } else {
          setPosts(fetchedPosts);
        }

        if (pagination) {
          setHasMore(pagination.currentPage < pagination.numberOfPages);
        } else {
          setHasMore(fetchedPosts.length >= 10);
        }
      } catch (err) {
        console.error('Error fetching posts:', err);
        toast.error('Failed to load posts feed');
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [activeTab]
  );

  useEffect(() => {
    setPage(1);
    fetchPosts(1, false);
  }, [fetchPosts, activeTab]);

  // Listen for global post-created event
  useEffect(() => {
    const handleNewPost = () => {
      setPage(1);
      fetchPosts(1, false);
    };
    window.addEventListener('post-created', handleNewPost);
    return () => window.removeEventListener('post-created', handleNewPost);
  }, [fetchPosts]);

  const handleLoadMore = () => {
    if (isLoadingMore || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage, true);
  };

  const handlePostUpdated = (updated) => {
    setPosts((prev) =>
      prev.map((p) => ((p._id || p.id) === (updated._id || updated.id) ? updated : p))
    );
  };

  const confirmDeletePost = async () => {
    if (!deletingPost) return;
    setIsDeleting(true);
    try {
      await deletePost(deletingPost._id || deletingPost.id);
      toast.success('Post deleted successfully');
      setPosts((prev) => prev.filter((p) => (p._id || p.id) !== (deletingPost._id || deletingPost.id)));
      setDeletingPost(null);
    } catch (err) {
      console.error('Error deleting post:', err);
      toast.error(err.response?.data?.message || 'Failed to delete post');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Quick Create Post Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <Avatar src={user?.photo} alt={user?.name} size="md" />
          <button
            onClick={openCreatePost}
            className="flex-1 text-left px-4 py-2.5 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400 text-sm font-medium transition-colors cursor-pointer border border-slate-200/60"
          >
            What's on your mind, {user?.name?.split(' ')[0] || 'friend'}?
          </button>
        </div>

        <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={openCreatePost}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors cursor-pointer"
          >
            <ImageIcon className="w-4 h-4 text-emerald-500" />
            <span>Photo / Media</span>
          </button>

          <button
            onClick={openCreatePost}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            Post
          </button>
        </div>
      </div>

      {/* Feed Filters */}
      <div className="flex items-center justify-between bg-white rounded-2xl border border-slate-200/80 p-1.5 shadow-xs">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-blue-50 text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>All Posts</span>
          </button>

          <button
            onClick={() => setActiveTab('feed')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'feed'
                ? 'bg-blue-50 text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Timeline Feed</span>
          </button>
        </div>

        <button
          onClick={() => {
            setPage(1);
            fetchPosts(1, false);
          }}
          className="p-2 text-slate-400 hover:text-blue-600 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
          title="Refresh Feed"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Posts Stream */}
      {isLoading ? (
        <LoadingSpinner text="Loading latest posts..." />
      ) : posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post._id || post.id}
              post={post}
              onEditPost={(p) => setEditingPost(p)}
              onDeletePost={(p) => setDeletingPost(p)}
              onPostUpdated={handlePostUpdated}
            />
          ))}

          {/* Load More Button */}
          {hasMore && (
            <div className="pt-2 text-center">
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="px-6 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isLoadingMore ? 'Loading more...' : 'Load More Posts'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">No posts yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Be the first to share something with the community!
          </p>
          <button
            onClick={openCreatePost}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold shadow-xs hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Create Post
          </button>
        </div>
      )}

      {/* Edit Post Modal */}
      <EditPostModal
        isOpen={!!editingPost}
        post={editingPost}
        onClose={() => setEditingPost(null)}
        onPostUpdated={handlePostUpdated}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingPost}
        title="Delete Post"
        description="Are you sure you want to delete this post? This cannot be undone."
        isDeleting={isDeleting}
        onClose={() => setDeletingPost(null)}
        onConfirm={confirmDeletePost}
      />
    </div>
  );
};
