import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyProfile, getUserProfile, getUserPosts, uploadProfilePhoto } from '../api/auth';
import { deletePost } from '../api/posts';
import { Avatar } from '../components/common/Avatar';
import { PostCard } from '../components/posts/PostCard';
import { EditPostModal } from '../components/posts/EditPostModal';
import { DeleteConfirmModal } from '../components/posts/DeleteConfirmModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  Camera,
  Calendar,
  Mail,
  User as UserIcon,
  Sparkles,
  FileText,
  Bookmark,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export const ProfilePage = () => {
  const { userId } = useParams();
  const { user: authUser, updateUser } = useAuth();
  const isOwnProfile = !userId || userId === authUser?._id || userId === authUser?.id;

  const [profile, setProfile] = useState(isOwnProfile ? authUser : null);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Modals
  const [editingPost, setEditingPost] = useState(null);
  const [deletingPost, setDeletingPost] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fileInputRef = useRef(null);

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      if (isOwnProfile) {
        const res = await getMyProfile();
        if (res.data?.user) {
          setProfile(res.data.user);
          updateUser(res.data.user);
        }
        // Also fetch user's posts
        const currentId = res.data?.user?._id || authUser?._id || authUser?.id;
        if (currentId) {
          const postsRes = await getUserPosts(currentId);
          setPosts(postsRes.data?.posts || []);
        }
      } else {
        const res = await getUserProfile(userId);
        if (res.data?.user) {
          setProfile(res.data.user);
        }
        const postsRes = await getUserPosts(userId);
        setPosts(postsRes.data?.posts || []);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      toast.error('Failed to load profile details');
    } finally {
      setIsLoading(false);
    }
  }, [userId, isOwnProfile, authUser?._id, authUser?.id, updateUser]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const res = await uploadProfilePhoto(file);
      toast.success('Profile photo updated successfully!');
      if (res.data?.user?.photo || res.data?.photo) {
        const newPhoto = res.data.user?.photo || res.data.photo;
        setProfile((prev) => ({ ...prev, photo: newPhoto }));
        updateUser({ photo: newPhoto });
      } else {
        loadProfile();
      }
    } catch (err) {
      console.error('Photo upload error:', err);
      toast.error(err.response?.data?.message || 'Failed to update photo');
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
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
      toast.success('Post removed');
      setPosts((prev) => prev.filter((p) => (p._id || p.id) !== (deletingPost._id || deletingPost.id)));
      setDeletingPost(null);
    } catch (err) {
      console.error('Error deleting post:', err);
      toast.error('Failed to delete post');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Joined recently';
    try {
      return format(new Date(dateStr), 'MMMM yyyy');
    } catch {
      return 'Recently';
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading profile..." />;
  }

  const userToShow = profile || authUser;

  return (
    <div className="space-y-6">
      {/* Profile Card & Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Cover Banner */}
        <div className="h-44 sm:h-52 bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 relative">
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Route Academy Member</span>
          </div>
        </div>

        {/* Profile Info Row */}
        <div className="px-6 pb-6 relative">
          {/* Avatar with Upload button */}
          <div className="relative -mt-16 sm:-mt-20 inline-block mb-3">
            <Avatar
              src={userToShow?.photo}
              alt={userToShow?.name}
              size="2xl"
              className="border-4 border-white shadow-lg"
            />
            {isOwnProfile && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="profile-avatar-upload"
                />
                <label
                  htmlFor="profile-avatar-upload"
                  className="absolute bottom-1 right-1 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-md cursor-pointer transition-transform hover:scale-110 active:scale-95"
                  title="Update profile picture"
                >
                  {isUploadingPhoto ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </label>
              </>
            )}
          </div>

          {/* Names and Bio */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {userToShow?.name || 'Explorer'}
                </h1>
                <p className="text-xs text-slate-400">@{userToShow?.username || 'user'}</p>
              </div>

              {isOwnProfile && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full border border-blue-100">
                    Your Profile
                  </span>
                </div>
              )}
            </div>

            {/* Details Pills */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
              {userToShow?.email && (
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{userToShow.email}</span>
                </div>
              )}
              {userToShow?.gender && (
                <div className="flex items-center gap-1.5 capitalize">
                  <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span>{userToShow.gender}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Joined {formatDate(userToShow?.createdAt)}</span>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="flex items-center gap-6 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-slate-900">{posts.length}</span>
                <span className="text-xs text-slate-400">Posts</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-slate-900">
                  {userToShow?.followersCount || userToShow?.followers?.length || 0}
                </span>
                <span className="text-xs text-slate-400">Followers</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-slate-900">
                  {userToShow?.followingCount || userToShow?.following?.length || 0}
                </span>
                <span className="text-xs text-slate-400">Following</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'posts'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Posts ({posts.length})</span>
        </button>
      </div>

      {/* User Posts Stream */}
      {posts.length > 0 ? (
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
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-3">
          <Sparkles className="w-8 h-8 text-blue-500 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">No posts shared yet</h3>
          <p className="text-xs text-slate-400">
            {isOwnProfile
              ? 'You have not shared any posts yet. Start by writing your first update!'
              : 'This user has not posted anything yet.'}
          </p>
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
        description="Are you sure you want to delete this post? This action cannot be undone."
        isDeleting={isDeleting}
        onClose={() => setDeletingPost(null)}
        onConfirm={confirmDeletePost}
      />
    </div>
  );
};
