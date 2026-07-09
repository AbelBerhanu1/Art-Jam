// ============================================
// Auth Functions
// ============================================

// Register user
async function handleRegister(e) {
    e.preventDefault();

    const username = document.getElementById('reg-username').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const displayName = document.getElementById('reg-displayname').value.trim() || username;

    const result = await registerUser(username, email, password, displayName);

    if (result.ok) {
        setToken(result.data.token);
        setCurrentUser(result.data.user);
        showMessage('Registration successful! Welcome ' + result.data.user.display_name, 'success');
        setTimeout(() => navigateTo('home'), 500);
    } else {
        showMessage(result.data.error || 'Registration failed', 'error');
    }
}

// Login user
async function handleLogin(e) {
    e.preventDefault();

    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    const result = await loginUser(username, password);

    if (result.ok) {
        setToken(result.data.token);
        setCurrentUser(result.data.user);
        showMessage('Welcome back, ' + result.data.user.display_name + '!', 'success');
        setTimeout(() => navigateTo('home'), 500);
    } else {
        showMessage(result.data.error || 'Login failed', 'error');
    }
}

// Logout user
function logoutUser() {
    removeToken();
    removeCurrentUser();
    updateNav();
    navigateTo('home');
    showMessage('Logged out successfully', 'info');
}

// Check if user is logged in and update nav
function updateNav() {
    const isLoggedIn = isAuthenticated();
    const user = getCurrentUser();

    const authLinks = document.getElementById('auth-links');
    const userLinks = document.getElementById('user-links');
    const usernameDisplay = document.getElementById('nav-username');

    if (isLoggedIn && user) {
        authLinks.style.display = 'none';
        userLinks.style.display = 'flex';
        usernameDisplay.textContent = user.display_name || user.username;
        usernameDisplay.onclick = function(e) {
            e.preventDefault();
            navigateTo('profile', { id: user.id });
        };
    } else {
        authLinks.style.display = 'flex';
        userLinks.style.display = 'none';
    }
}

// Show message
function showMessage(text, type = 'info') {
    const container = document.getElementById('page-content');
    const existing = container.querySelector('.message');
    if (existing) existing.remove();

    const msg = document.createElement('div');
    msg.className = `message ${type}`;
    msg.textContent = text;
    container.insertBefore(msg, container.firstChild);

    setTimeout(() => {
        if (msg.parentNode) msg.remove();
    }, 5000);
}