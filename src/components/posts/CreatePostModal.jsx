import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { createPost } from '../../api/posts';
import { Avatar } from '../common/Avatar';
import { X, Image as ImageIcon, Sparkles, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const CreatePostModal = ({ isOpen, onClose, onPostCreated }) => {
  const { user } = useAuth();
  const [body, setBody] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
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
    if (!body.trim() && !imageFile) {
      toast.error('Please write something or attach an image.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createPost({
        body: body.trim(),
        image: imageFile,
      });

      toast.success('Post created successfully!');
      if (onPostCreated && res.data?.post) {
        onPostCreated(res.data.post);
      }
      // Reset
      setBody('');
      removeImage();
      onClose();
    } catch (err) {
      console.error('Error creating post:', err);
      toast.error(err.response?.data?.message || 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h2 className="font-bold text-base text-slate-800">Create a Post</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Avatar src={user?.photo} alt={user?.name} size="md" />
            <div>
              <p className="font-bold text-sm text-slate-900">{user?.name}</p>
              <span className="text-xs text-slate-400">Public post</span>
            </div>
          </div>

          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="What's happening? Share your thoughts..."
            rows={4}
            className="w-full text-slate-800 placeholder-slate-400 border-none focus:ring-0 focus:outline-hidden resize-none text-base leading-relaxed p-0"
            autoFocus
          />

          {/* Image Preview */}
          {imagePreview && (
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 group max-h-72 flex items-center justify-center">
              <img
                src={imagePreview}
                alt="Selected preview"
                className="w-full h-auto max-h-72 object-contain"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 p-1.5 bg-slate-950/70 hover:bg-slate-950 text-white rounded-full transition-all cursor-pointer shadow-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Actions & File upload */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="post-image-upload"
              />
              <label
                htmlFor="post-image-upload"
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer"
              >
                <ImageIcon className="w-4 h-4" />
                <span>{imageFile ? 'Change Image' : 'Attach Photo'}</span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || (!body.trim() && !imageFile)}
                className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <span>Publish</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
