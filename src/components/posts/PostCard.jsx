import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common/Avatar';
import { toggleLikePost, toggleBookmarkPost, sharePost } from '../../api/posts';
import { formatDistanceToNow } from 'date-fns';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Edit2,
  Trash2,
  Repeat,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const PostCard = ({
  post,
  onEditPost,
  onDeletePost,
  onPostUpdated,
  showFullDetails = false,
}) => {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  // Check if current user liked this post
  const currentUserId = user?._id || user?.id;
  const isPostLiked =
    post.likes?.some((like) =>
      typeof like === 'string' ? like === currentUserId : like._id === currentUserId
    ) || false;

  const [isLiked, setIsLiked] = useState(isPostLiked);
  const [likesCount, setLikesCount] = useState(post.likesCount || post.likes?.length || 0);
  const [isBookmarked, setIsBookmarked] = useState(post.bookmarked || false);
  const [isLiking, setIsLiking] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);

  // Is current user author?
  const postAuthorId = post.user?._id || post.user?.id;
  const isAuthor = currentUserId && postAuthorId && currentUserId === postAuthorId;

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);

    const prevLiked = isLiked;
    const prevCount = likesCount;

    // Optimistic update
    setIsLiked(!prevLiked);
    setLikesCount(prevLiked ? Math.max(0, prevCount - 1) : prevCount + 1);

    try {
      await toggleLikePost(post._id || post.id);
    } catch (err) {
      // Revert on error
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
      toast.error('Failed to update like');
    } finally {
      setIsLiking(false);
    }
  };

  const handleBookmark = async () => {
    if (isBookmarking) return;
    setIsBookmarking(true);
    const prevBookmarked = isBookmarked;
    setIsBookmarked(!prevBookmarked);

    try {
      await toggleBookmarkPost(post._id || post.id);
      toast.success(prevBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks');
    } catch (err) {
      setIsBookmarked(prevBookmarked);
      toast.error('Failed to update bookmark');
    } finally {
      setIsBookmarking(false);
    }
  };

  const handleShare = async () => {
    try {
      await sharePost(post._id || post.id, `Shared: ${post.body?.slice(0, 50)}...`);
      toast.success('Post shared to your timeline!');
    } catch (err) {
      // If error, copy link to clipboard
      navigator.clipboard.writeText(window.location.origin + `/posts/${post._id || post.id}`);
      toast.success('Link copied to clipboard!');
    }
  };

  const formatPostTime = (dateStr) => {
    if (!dateStr) return '';
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch {
      return 'recently';
    }
  };

  return (
    <article className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Repost Header Banner if shared */}
      {post.isShare && (
        <div className="px-5 pt-3 pb-1 text-xs font-semibold text-slate-500 flex items-center gap-1.5 border-b border-slate-100 bg-slate-50/50">
          <Repeat className="w-3.5 h-3.5 text-blue-600" />
          <span>{post.user?.name} shared this post</span>
        </div>
      )}

      {/* Post Author Bar */}
      <div className="p-5 pb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${postAuthorId}`}>
            <Avatar src={post.user?.photo} alt={post.user?.name} size="md" />
          </Link>
          <div>
            <Link
              to={`/profile/${postAuthorId}`}
              className="font-bold text-sm text-slate-900 hover:text-blue-600 transition-colors"
            >
              {post.user?.name || 'Anonymous User'}
            </Link>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span>@{post.user?.username || 'user'}</span>
              <span>•</span>
              <span>{formatPostTime(post.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Author Actions dropdown */}
        {isAuthor && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-1 w-36 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-20 animate-in fade-in duration-100">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    if (onEditPost) onEditPost(post);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-left"
                >
                  <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Edit Post</span>
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    if (onDeletePost) onDeletePost(post);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Delete Post</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Post Text Content */}
      <div className="px-5 py-2">
        <p className="text-slate-800 text-[15px] leading-relaxed whitespace-pre-line select-text">
          {post.body}
        </p>
      </div>

      {/* Post Image Media */}
      {post.image && (
        <div className="mt-3 bg-slate-100 max-h-[500px] flex items-center justify-center overflow-hidden">
          <img
            src={post.image}
            alt="Post media"
            className="w-full h-auto max-h-[500px] object-cover hover:scale-[1.01] transition-transform duration-300"
            loading="lazy"
          />
        </div>
      )}

      {/* Embedded Shared Post (if present) */}
      {post.sharedPost && (
        <div className="m-4 p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
          <div className="flex items-center gap-2.5">
            <Avatar src={post.sharedPost.user?.photo} alt={post.sharedPost.user?.name} size="sm" />
            <div>
              <p className="text-xs font-bold text-slate-800">{post.sharedPost.user?.name}</p>
              <p className="text-[11px] text-slate-400">@{post.sharedPost.user?.username}</p>
            </div>
          </div>
          {post.sharedPost.body && (
            <p className="text-xs text-slate-700 leading-relaxed">{post.sharedPost.body}</p>
          )}
          {post.sharedPost.image && (
            <img
              src={post.sharedPost.image}
              alt="Shared media"
              className="rounded-lg max-h-60 w-full object-cover mt-2"
            />
          )}
        </div>
      )}

      {/* Interaction Stats */}
      <div className="px-5 pt-3 flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 mt-2">
        <span className="flex items-center gap-1">
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          <span>{likesCount} {likesCount === 1 ? 'like' : 'likes'}</span>
        </span>
        <div className="flex items-center gap-3">
          <Link
            to={`/posts/${post._id || post.id}`}
            className="hover:text-blue-600 transition-colors"
          >
            {post.commentsCount || 0} {post.commentsCount === 1 ? 'comment' : 'comments'}
          </Link>
          <span>{post.sharesCount || 0} shares</span>
        </div>
      </div>

      {/* Interaction Action Buttons */}
      <div className="px-3 py-2 flex items-center justify-between border-t border-slate-100 mt-2">
        {/* Like */}
        <button
          onClick={handleLike}
          className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer flex-1 ${
            isLiked
              ? 'text-rose-600 bg-rose-50/60'
              : 'text-slate-600 hover:bg-slate-50 hover:text-rose-600'
          }`}
        >
          <Heart className={`w-4 h-4 transition-transform ${isLiked ? 'fill-rose-600 scale-110' : ''}`} />
          <span>{isLiked ? 'Liked' : 'Like'}</span>
        </button>

        {/* Comment */}
        <Link
          to={`/posts/${post._id || post.id}`}
          className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-all flex-1"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Comment</span>
        </Link>

        {/* Share */}
        <button
          onClick={handleShare}
          className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-all cursor-pointer flex-1"
        >
          <Share2 className="w-4 h-4" />
          <span>Share</span>
        </button>

        {/* Bookmark */}
        <button
          onClick={handleBookmark}
          className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer flex-1 ${
            isBookmarked
              ? 'text-amber-600 bg-amber-50/60'
              : 'text-slate-600 hover:bg-slate-50 hover:text-amber-600'
          }`}
        >
          <Bookmark
            className={`w-4 h-4 transition-transform ${isBookmarked ? 'fill-amber-500 scale-110' : ''}`}
          />
          <span className="hidden sm:inline">{isBookmarked ? 'Saved' : 'Save'}</span>
        </button>
      </div>
    </article>
  );
};
