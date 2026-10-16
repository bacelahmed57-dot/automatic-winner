import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getSinglePost, deletePost } from '../api/posts';
import { getPostComments } from '../api/comments';
import { PostCard } from '../components/posts/PostCard';
import { CommentItem } from '../components/comments/CommentItem';
import { CreateCommentBox } from '../components/comments/CreateCommentBox';
import { EditPostModal } from '../components/posts/EditPostModal';
import { DeleteConfirmModal } from '../components/posts/DeleteConfirmModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ArrowLeft, MessageSquare, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export const PostDetailPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingComments, setIsLoadingComments] = useState(true);

  // Modals
  const [isEditing, setIsEditing] = useState(false);
  const [isDeletingPost, setIsDeletingPost] = useState(false);
  const [deletingProgress, setDeletingProgress] = useState(false);

  const fetchPostData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getSinglePost(postId);
      if (res.data?.post) {
        setPost(res.data.post);
      }
    } catch (err) {
      console.error('Error fetching post:', err);
      toast.error('Post not found or could not be loaded');
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  const fetchComments = useCallback(async () => {
    setIsLoadingComments(true);
    try {
      const res = await getPostComments(postId, 1, 50);
      if (res.data?.comments) {
        setComments(res.data.comments);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setIsLoadingComments(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchPostData();
    fetchComments();
  }, [fetchPostData, fetchComments]);

  const handlePostUpdated = (updated) => {
    setPost(updated);
  };

  const handleCommentAdded = (newComment) => {
    setComments((prev) => [newComment, ...prev]);
    setPost((prev) => (prev ? { ...prev, commentsCount: (prev.commentsCount || 0) + 1 } : prev));
  };

  const handleCommentDeleted = (commentId) => {
    setComments((prev) => prev.filter((c) => (c._id || c.id) !== commentId));
    setPost((prev) =>
      prev ? { ...prev, commentsCount: Math.max(0, (prev.commentsCount || 1) - 1) } : prev
    );
  };

  const handleCommentUpdated = (updatedComment) => {
    setComments((prev) =>
      prev.map((c) =>
        (c._id || c.id) === (updatedComment._id || updatedComment.id) ? updatedComment : c
      )
    );
  };

  const handleDeletePost = async () => {
    setDeletingProgress(true);
    try {
      await deletePost(postId);
      toast.success('Post deleted successfully');
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Error deleting post:', err);
      toast.error('Failed to delete post');
    } finally {
      setDeletingProgress(false);
      setIsDeletingPost(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading post discussion..." />;
  }

  if (!post) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-4">
        <h3 className="text-lg font-bold text-slate-800">Post not found</h3>
        <p className="text-xs text-slate-500">
          The post you are looking for may have been removed or does not exist.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Feed</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Back Button */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-white hover:text-slate-900 border border-transparent hover:border-slate-200 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      </div>

      {/* Main Post Card */}
      <PostCard
        post={post}
        showFullDetails={true}
        onEditPost={() => setIsEditing(true)}
        onDeletePost={() => setIsDeletingPost(true)}
        onPostUpdated={handlePostUpdated}
      />

      {/* Comments Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-900">
              Discussion ({comments.length})
            </h3>
          </div>
        </div>

        {/* Add Comment Box */}
        <CreateCommentBox postId={postId} onCommentAdded={handleCommentAdded} />

        {/* Comment List */}
        {isLoadingComments ? (
          <LoadingSpinner text="Loading comments..." />
        ) : comments.length > 0 ? (
          <div className="divide-y divide-slate-100 pt-2">
            {comments.map((comment) => (
              <CommentItem
                key={comment._id || comment.id}
                postId={postId}
                comment={comment}
                onCommentDeleted={handleCommentDeleted}
                onCommentUpdated={handleCommentUpdated}
              />
            ))}
          </div>
        ) : (
          <div className="py-8 text-center space-y-2">
            <p className="text-xs text-slate-400">No comments yet. Start the conversation!</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <EditPostModal
        isOpen={isEditing}
        post={post}
        onClose={() => setIsEditing(false)}
        onPostUpdated={handlePostUpdated}
      />

      <DeleteConfirmModal
        isOpen={isDeletingPost}
        title="Delete Post"
        description="Are you sure you want to delete this post? This action cannot be undone."
        isDeleting={deletingProgress}
        onClose={() => setIsDeletingPost(false)}
        onConfirm={handleDeletePost}
      />
    </div>
  );
};
