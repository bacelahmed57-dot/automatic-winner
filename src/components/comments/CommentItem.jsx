import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common/Avatar';
import { updateComment, deleteComment, toggleCommentLike } from '../../api/comments';
import { formatDistanceToNow } from 'date-fns';
import { Heart, Edit2, Trash2, Check, X, Loader2, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export const CommentItem = ({
  postId,
  comment,
  onCommentDeleted,
  onCommentUpdated,
}) => {
  const { user } = useAuth();
  const currentUserId = user?._id || user?.id;
  const commentAuthorId = comment.commentCreator?._id || comment.commentCreator?.id || comment.user?._id;

  const isAuthor = currentUserId && commentAuthorId && currentUserId === commentAuthorId;

  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(comment.content || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Likes
  const isCommentLiked =
    comment.likes?.some((like) =>
      typeof like === 'string' ? like === currentUserId : like._id === currentUserId
    ) || false;

  const [isLiked, setIsLiked] = useState(isCommentLiked);
  const [likesCount, setLikesCount] = useState(comment.likesCount || comment.likes?.length || 0);

  const handleToggleLike = async () => {
    const prevLiked = isLiked;
    const prevCount = likesCount;

    setIsLiked(!prevLiked);
    setLikesCount(prevLiked ? Math.max(0, prevCount - 1) : prevCount + 1);

    try {
      await toggleCommentLike(postId, comment._id || comment.id);
    } catch (err) {
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
      toast.error('Failed to like comment');
    }
  };

  const handleSaveEdit = async () => {
    if (!content.trim()) {
      toast.error('Comment content cannot be empty');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await updateComment(postId, comment._id || comment.id, {
        content: content.trim(),
      });
      toast.success('Comment updated!');
      setIsEditing(false);
      if (onCommentUpdated && res.data?.comment) {
        onCommentUpdated(res.data.comment);
      }
    } catch (err) {
      console.error('Error updating comment:', err);
      toast.error(err.response?.data?.message || 'Failed to update comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    setIsDeleting(true);
    try {
      await deleteComment(postId, comment._id || comment.id);
      toast.success('Comment deleted');
      if (onCommentDeleted) {
        onCommentDeleted(comment._id || comment.id);
      }
    } catch (err) {
      console.error('Error deleting comment:', err);
      toast.error(err.response?.data?.message || 'Failed to delete comment');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatCommentTime = (dateStr) => {
    if (!dateStr) return '';
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch {
      return '';
    }
  };

  const authorName = comment.commentCreator?.name || comment.user?.name || 'User';
  const authorPhoto = comment.commentCreator?.photo || comment.user?.photo;

  return (
    <div className="flex items-start gap-3 py-3 group">
      <Avatar src={authorPhoto} alt={authorName} size="sm" className="mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="bg-slate-50 rounded-2xl px-4 py-2.5 border border-slate-100 space-y-1 inline-block max-w-full">
          <div className="flex items-center justify-between gap-3">
            <span className="font-bold text-xs text-slate-800">{authorName}</span>
            <span className="text-[11px] text-slate-400">
              {formatCommentTime(comment.createdAt)}
            </span>
          </div>

          {isEditing ? (
            <div className="space-y-2 mt-1">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={2}
                className="w-full text-xs text-slate-800 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-blue-500 focus:outline-hidden bg-white"
                autoFocus
              />
              <div className="flex items-center justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-2.5 py-1 text-xs text-slate-500 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={isSubmitting}
                  className="px-2.5 py-1 text-xs text-white bg-blue-600 hover:bg-blue-700 rounded-md font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save'}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap select-text">
              {comment.content}
            </p>
          )}

          {/* Comment Image (if any) */}
          {comment.image && (
            <div className="mt-2 rounded-lg overflow-hidden max-h-48">
              <img
                src={comment.image}
                alt="Comment attachment"
                className="object-cover max-h-48 rounded-lg"
              />
            </div>
          )}
        </div>

        {/* Comment Action Links */}
        {!isEditing && (
          <div className="flex items-center gap-3 px-2 pt-1 text-[11px] text-slate-400">
            <button
              onClick={handleToggleLike}
              className={`font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                isLiked ? 'text-rose-600' : 'hover:text-slate-600'
              }`}
            >
              <Heart className={`w-3 h-3 ${isLiked ? 'fill-rose-600' : ''}`} />
              <span>{likesCount > 0 ? likesCount : 'Like'}</span>
            </button>

            {isAuthor && (
              <>
                <span>•</span>
                <button
                  onClick={() => setIsEditing(true)}
                  className="hover:text-blue-600 transition-colors cursor-pointer"
                >
                  Edit
                </button>
                <span>•</span>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="hover:text-rose-600 transition-colors cursor-pointer text-rose-500/80"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
