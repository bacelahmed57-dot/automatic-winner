import apiClient from './client';

export const getPostComments = async (postId, page = 1, limit = 20) => {
  const response = await apiClient.get(`/posts/${postId}/comments?page=${page}&limit=${limit}`);
  return response.data;
};

export const createComment = async (postId, { content, image }) => {
  const formData = new FormData();
  if (content) formData.append('content', content);
  if (image) formData.append('image', image);

  const response = await apiClient.post(`/posts/${postId}/comments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const updateComment = async (postId, commentId, { content, image }) => {
  const formData = new FormData();
  if (content !== undefined) formData.append('content', content);
  if (image) formData.append('image', image);

  const response = await apiClient.put(`/posts/${postId}/comments/${commentId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteComment = async (postId, commentId) => {
  const response = await apiClient.delete(`/posts/${postId}/comments/${commentId}`);
  return response.data;
};

export const toggleCommentLike = async (postId, commentId) => {
  const response = await apiClient.put(`/posts/${postId}/comments/${commentId}/like`);
  return response.data;
};

export const getCommentReplies = async (postId, commentId, page = 1, limit = 10) => {
  const response = await apiClient.get(`/posts/${postId}/comments/${commentId}/replies?page=${page}&limit=${limit}`);
  return response.data;
};

export const createCommentReply = async (postId, commentId, { content, image }) => {
  const formData = new FormData();
  if (content) formData.append('content', content);
  if (image) formData.append('image', image);

  const response = await apiClient.post(`/posts/${postId}/comments/${commentId}/replies`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};
