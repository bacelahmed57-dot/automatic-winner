import apiClient from './client';

export const getAllPosts = async (page = 1, limit = 15) => {
  const response = await apiClient.get(`/posts?page=${page}&limit=${limit}`);
  return response.data;
};

export const getFeedPosts = async (only = 'all', page = 1, limit = 15) => {
  const response = await apiClient.get(`/posts/feed?only=${only}&page=${page}&limit=${limit}`);
  return response.data;
};

export const getSinglePost = async (postId) => {
  const response = await apiClient.get(`/posts/${postId}`);
  return response.data;
};

export const createPost = async ({ body, image }) => {
  const formData = new FormData();
  if (body) formData.append('body', body);
  if (image) formData.append('image', image);

  const response = await apiClient.post('/posts', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const updatePost = async (postId, { body, image }) => {
  const formData = new FormData();
  if (body !== undefined) formData.append('body', body);
  if (image) formData.append('image', image);

  const response = await apiClient.put(`/posts/${postId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deletePost = async (postId) => {
  const response = await apiClient.delete(`/posts/${postId}`);
  return response.data;
};

export const toggleLikePost = async (postId) => {
  const response = await apiClient.put(`/posts/${postId}/like`);
  return response.data;
};

export const toggleBookmarkPost = async (postId) => {
  const response = await apiClient.put(`/posts/${postId}/bookmark`);
  return response.data;
};

export const sharePost = async (postId, bodyText = '') => {
  const response = await apiClient.post(`/posts/${postId}/share`, {
    body: bodyText,
  });
  return response.data;
};
