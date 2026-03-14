import axios from 'axios';

const API = axios.create({ baseURL: '/api', withCredentials: true });

API.interceptors.request.use(config => {
  const token = localStorage.getItem('fh_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, error => Promise.reject(error));

API.interceptors.response.use(
  res => res,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('fh_token');
      localStorage.removeItem('fh_user');
      if (window.location.pathname !== '/login') window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: data => API.post('/auth/register', data),
  login: data => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  verifyEmail: token => API.get(`/auth/verify-email/${token}`),
  forgotPassword: email => API.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => API.put(`/auth/reset-password/${token}`, { password }),
  updatePassword: data => API.put('/auth/update-password', data),
};

export const userAPI = {
  getFreelancers: params => API.get('/users/freelancers', { params }),
  getFreelancerProfile: id => API.get(`/users/freelancer/${id}`),
  updateFreelancerProfile: data => API.put('/users/freelancer/profile', data),
  getEmployerProfile: id => API.get(`/users/employer/${id}`),
  updateEmployerProfile: data => API.put('/users/employer/profile', data),
  getDashboardStats: () => API.get('/users/dashboard/stats'),
  getSavedJobs: () => API.get('/users/saved-jobs'),
  toggleSaveJob: id => API.put(`/users/saved-jobs/${id}`),
};

export const projectAPI = {
  getProjects: params => API.get('/projects', { params }),
  getProject: id => API.get(`/projects/${id}`),
  createProject: data => API.post('/projects', data),
  updateProject: (id, data) => API.put(`/projects/${id}`, data),
  deleteProject: id => API.delete(`/projects/${id}`),
  getMyProjects: params => API.get('/projects/my', { params }),
  awardProject: (id, freelancerId) => API.post(`/projects/${id}/award`, { freelancerId }),
  getProjectMatches: id => API.get(`/projects/${id}/matches`),
  getRecommendedProjects: () => API.get('/projects/recommended'),
};

export const gigAPI = {
  getGigs: params => API.get('/gigs', { params }),
  getGig: id => API.get(`/gigs/${id}`),
  createGig: data => API.post('/gigs', data),
  updateGig: (id, data) => API.put(`/gigs/${id}`, data),
  deleteGig: id => API.delete(`/gigs/${id}`),
  getMyGigs: () => API.get('/gigs/my'),
  orderGig: (id, data) => API.post(`/gigs/${id}/order`, data),
};

export const applicationAPI = {
  apply: (projectId, data) => API.post(`/applications/project/${projectId}`, data),
  getProjectApplications: (projectId, params) => API.get(`/applications/project/${projectId}`, { params }),
  getMyApplications: params => API.get('/applications/my', { params }),
  updateStatus: (id, status) => API.put(`/applications/${id}/status`, { status }),
  withdraw: id => API.put(`/applications/${id}/withdraw`),
};

export const contractAPI = {
  getMyContracts: params => API.get('/contracts', { params }),
  getContract: id => API.get(`/contracts/${id}`),
  accept: id => API.put(`/contracts/${id}/accept`),
  submitMilestone: (id, data) => API.post(`/contracts/${id}/milestone/submit`, data),
  submitWork: id => API.post(`/contracts/${id}/submit`),
  requestRevision: (id, data) => API.post(`/contracts/${id}/revision`, data),
  logTime: (id, data) => API.post(`/contracts/${id}/time`, data),
  createDirect: data => API.post('/contracts/direct', data),
};

export const paymentAPI = {
  createEscrowOrder: data => API.post('/payments/escrow/create', data),
  verifyEscrowPayment: data => API.post('/payments/escrow/verify', data),
  releasePayment: id => API.post(`/payments/release/${id}`),
  getPaymentHistory: () => API.get('/payments/history'),
  getEarningsSummary: () => API.get('/payments/earnings'),
  buyConnects: data => API.post('/payments/connects/buy', data),
  verifyConnectsPayment: data => API.post('/payments/connects/verify', data),
};

export const messageAPI = {
  getConversations: () => API.get('/messages/conversations'),
  getMessages: (userId, params) => API.get(`/messages/${userId}`, { params }),
  sendMessage: data => API.post('/messages', data),
  deleteMessage: id => API.delete(`/messages/${id}`),
  markAsRead: userId => API.put(`/messages/read/${userId}`),
  getUnreadCount: () => API.get('/messages/unread'),
};

export const reviewAPI = {
  createReview: data => API.post('/reviews', data),
  getUserReviews: (userId, params) => API.get(`/reviews/user/${userId}`, { params }),
  getGigReviews: gigId => API.get(`/reviews/gig/${gigId}`),
};

export const notificationAPI = {
  getNotifications: params => API.get('/notifications', { params }),
  markAsRead: id => API.put(`/notifications/${id}/read`),
  markAllRead: () => API.put('/notifications/read-all'),
  delete: id => API.delete(`/notifications/${id}`),
};

export const aiAPI = {
  generateProposal: data => API.post('/ai/proposal', data),
  generateJobPost: data => API.post('/ai/job-post', data),
  getRateAdvice: data => API.post('/ai/rate-advice', data),
  chat: data => API.post('/ai/chat', data),
  analyseProposal: data => API.post('/ai/analyse-proposal', data),
};

export const adminAPI = {
  getStats: () => API.get('/admin/stats'),
  getUsers: params => API.get('/admin/users', { params }),
  updateUser: (id, data) => API.put(`/admin/users/${id}`, data),
  getDisputes: params => API.get('/admin/disputes', { params }),
  resolveDispute: (id, data) => API.put(`/admin/disputes/${id}/resolve`, data),
  getProjects: params => API.get('/admin/projects', { params }),
  removeContent: data => API.post('/admin/remove-content', data),
};

export default API;
