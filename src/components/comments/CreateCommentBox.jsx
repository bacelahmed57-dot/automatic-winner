import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { createComment } from '../../api/comments';
import { Avatar } from '../common/Avatar';
import { Send, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const CreateCommentBox = ({ postId, onCommentAdded }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be under 5MB');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !imageFile) {
      toast.error('Write a comment or attach an image.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createComment(postId, {
        content: content.trim(),
        image: imageFile,
      });

      toast.success('Comment added!');
      setContent('');
      removeImage();

      if (onCommentAdded && res.data?.comment) {
        onCommentAdded(res.data.comment);
      }
    } catch (err) {
      console.error('Error posting comment:', err);
      toast.error(err.response?.data?.message || 'Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-4 border-t border-slate-100">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex items-start gap-3">
          <Avatar src={user?.photo} alt={user?.name} size="sm" className="mt-1" />
          <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl p-2.5 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write a comment..."
              rows={2}
              className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 border-none focus:outline-hidden resize-none p-0"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />

            {/* Attached image preview */}
            {imagePreview && (
              <div className="relative inline-block mt-2 rounded-lg overflow-hidden border border-slate-200">
                <img
                  src={imagePreview}
                  alt="Comment attachment"
                  className="w-20 h-20 object-cover"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-1 right-1 p-0.5 bg-black/60 text-white rounded-full hover:bg-black transition-colors cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 mt-1">
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id={`comment-img-upload-${postId}`}
                />
                <label
                  htmlFor={`comment-img-upload-${postId}`}
                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 hover:text-blue-600 cursor-pointer transition-colors p-1"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>{imageFile ? 'Change' : 'Photo'}</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || (!content.trim() && !imageFile)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all active:scale-95"
              >
                {isSubmitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
