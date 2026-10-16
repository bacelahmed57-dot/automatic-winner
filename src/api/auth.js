import apiClient from './client';

export const signupUser = async (data) => {
  const response = await apiClient.post('/users/signup', data);
  return response.data;
};

export const signinUser = async (data) => {
  const response = await apiClient.post('/users/signin', data);
  return response.data;
};

export const changePassword = async ({ password, newPassword }) => {
  const response = await apiClient.patch('/users/change-password', {
    password,
    newPassword,
  });
  return response.data;
};

export const getMyProfile = async () => {
  const response = await apiClient.get('/users/profile-data');
  return response.data;
};

export const getUserProfile = async (userId) => {
  const response = await apiClient.get(`/users/${userId}/profile`);
  return response.data;
};

export const getUserPosts = async (userId) => {
  const response = await apiClient.get(`/users/${userId}/posts`);
  return response.data;
};

export const uploadProfilePhoto = async (photoFile) => {
  const formData = new FormData();
  formData.append('photo', photoFile);
  const response = await apiClient.put('/users/upload-photo', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getFollowSuggestions = async (limit = 5) => {
  const response = await apiClient.get(`/users/suggestions?limit=${limit}`);
  return response.data;
};

export const getBookmarks = async () => {
  const response = await apiClient.get('/users/bookmarks');
  return response.data;
};
