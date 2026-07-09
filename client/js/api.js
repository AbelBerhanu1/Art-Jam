// ============================================
// API Client
// ============================================

const API_BASE = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : `http://${window.location.hostname}:5000/api`;

// Get auth token from localStorage
function getToken() {
    return localStorage.getItem('token');
}

// Set auth token in localStorage
function setToken(token) {
    localStorage.setItem('token', token);
}

// Remove auth token
function removeToken() {
    localStorage.removeItem('token');
}

// Get current user from localStorage
function getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

// Set current user in localStorage
function setCurrentUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
}

// Remove current user
function removeCurrentUser() {
    localStorage.removeItem('user');
}

// Check if user is authenticated
function isAuthenticated() {
    return !!getToken() && !!getCurrentUser();
}

// API request helper
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const token = getToken();

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers
    };

    // If body is FormData, remove Content-Type header (browser will set it)
    if (options.body instanceof FormData) {
        delete headers['Content-Type'];
    }

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        // Handle token expiry
        if (response.status === 401 && (data.error === 'Invalid token' || data.error === 'Token expired')) {
            removeToken();
            removeCurrentUser();
            // Redirect to login if on a page that requires auth
            if (window.navigateTo) {
                window.navigateTo('login');
            }
        }

        return {
            status: response.status,
            ok: response.ok,
            data
        };
    } catch (error) {
        console.error('API Error:', error);
        return {
            status: 500,
            ok: false,
            data: { error: 'Network error - is the server running?' }
        };
    }
}

// ============================================
// AUTH ENDPOINTS
// ============================================

async function registerUser(username, email, password, displayName) {
    return apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password, display_name: displayName })
    });
}

async function loginUser(username, password) {
    return apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
    });
}

async function getCurrentUserAPI() {
    return apiRequest('/auth/me', {
        method: 'GET'
    });
}

// ============================================
// PASSWORD ENDPOINTS (NEW)
// ============================================

// Change own password
async function changePassword(currentPassword, newPassword) {
    return apiRequest('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword })
    });
}

// Admin reset user password
async function adminResetPassword(userId, newPassword) {
    return apiRequest(`/auth/admin/reset-password/${userId}`, {
        method: 'POST',
        body: JSON.stringify({ newPassword })
    });
}

// ============================================
// SUBMISSION ENDPOINTS
// ============================================

async function getSubmissions(params = '') {
    return apiRequest(`/submissions${params}`, {
        method: 'GET'
    });
}

async function getSubmission(id) {
    return apiRequest(`/submissions/${id}`, {
        method: 'GET'
    });
}

async function createSubmission(formData) {
    return apiRequest('/submissions', {
        method: 'POST',
        body: formData
    });
}

async function updateSubmission(id, data) {
    return apiRequest(`/submissions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
}

async function deleteSubmission(id) {
    return apiRequest(`/submissions/${id}`, {
        method: 'DELETE'
    });
}

// ============================================
// VOTE ENDPOINTS
// ============================================

async function castVote(submissionId, value) {
    return apiRequest('/votes', {
        method: 'POST',
        body: JSON.stringify({ submission_id: submissionId, value })
    });
}

async function getSubmissionVotes(submissionId) {
    return apiRequest(`/votes/submission/${submissionId}`, {
        method: 'GET'
    });
}

// ============================================
// COMMENT ENDPOINTS
// ============================================

async function createComment(submissionId, content, parentId = null) {
    return apiRequest('/comments', {
        method: 'POST',
        body: JSON.stringify({ submission_id: submissionId, content, parent_id: parentId })
    });
}

async function getSubmissionComments(submissionId) {
    return apiRequest(`/comments/submission/${submissionId}`, {
        method: 'GET'
    });
}

async function deleteComment(id) {
    return apiRequest(`/comments/${id}`, {
        method: 'DELETE'
    });
}

// ============================================
// JAM ENDPOINTS
// ============================================

async function getJams(params = '') {
    return apiRequest(`/jams${params}`, {
        method: 'GET'
    });
}

async function getJam(id) {
    return apiRequest(`/jams/${id}`, {
        method: 'GET'
    });
}

// ============================================
// FOLLOW ENDPOINTS
// ============================================

async function followUser(userId) {
    return apiRequest(`/users/${userId}/follow`, {
        method: 'POST'
    });
}

async function unfollowUser(userId) {
    return apiRequest(`/users/${userId}/follow`, {
        method: 'DELETE'
    });
}

async function getFollowing(userId) {
    return apiRequest(`/users/${userId}/following`, {
        method: 'GET'
    });
}

async function getFollowers(userId) {
    return apiRequest(`/users/${userId}/followers`, {
        method: 'GET'
    });
}

async function getFeed() {
    return apiRequest('/users/feed', {
        method: 'GET'
    });
}

// ============================================
// CREATOR ENDPOINTS
// ============================================

async function getTopCreators() {
    return apiRequest('/users/top-creators', {
        method: 'GET'
    });
}

// ============================================
// USER PROFILE ENDPOINTS
// ============================================

// Get a user's profile by ID
async function getUserProfile(userId) {
    return apiRequest(`/users/${userId}`, {
        method: 'GET'
    });
}

// Update your own profile (bio + social links)
async function updateProfile(data) {
    return apiRequest('/users/profile', {
        method: 'PUT',
        body: JSON.stringify(data)
    });
}

async function updateAvatar(formData) {
    return apiRequest('/users/avatar', {
        method: 'POST',
        body: formData
    });
}