// ============================================
// STATE
// ============================================

let currentPage = 'home';
let currentParams = {};
let isNavigating = false;

// ============================================
// UUID GENERATOR - Fallback for non-secure contexts
// ============================================
function generateUUID() {
    if (crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

// ============================================
// SERVER URL - Dynamic for any device
// ============================================
const SERVER = `http://${window.location.hostname}:5000`;

// ============================================
// HELPER: Fix Image URL
// ============================================
function fixImageUrl(imageUrl) {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl;
    }
    if (imageUrl.startsWith('/')) {
        return SERVER + imageUrl;
    }
    return SERVER + '/' + imageUrl;
}

// ============================================
// BUBBLE HELPERS
// ============================================
function getBubbleX(i, total) {
    const count = Math.max(total, 1);
    const spacing = 82 / count;
    return Math.round(9 + i * spacing);
}

function getBubbleY(i) {
    const patterns = [12, 48, 20, 52, 28, 56, 16, 44];
    return patterns[i % patterns.length];
}

function getBubbleColor(i) {
    const colors = ['#c49a6c', '#b88a6a', '#8b7a5a', '#d4a05a', '#a88a6a', '#d4a05a'];
    return colors[i % colors.length];
}

function showCreatorCard(el, userId) {
    const u = window._creators[userId];
    if (!u) return;

    const card = document.getElementById('creator-card');
    const avatar = document.getElementById('cc-avatar');
    
    if (u.avatar_url) {
        avatar.innerHTML = `<img src="${fixImageUrl(u.avatar_url)}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`;
    } else {
        avatar.textContent = (u.display_name || u.username).charAt(0).toUpperCase();
        avatar.style.background = el.querySelector('.bubble-avatar').style.background;
        avatar.style.display = 'flex';
        avatar.style.alignItems = 'center';
        avatar.style.justifyContent = 'center';
    }

    document.getElementById('cc-name').textContent = u.display_name || u.username;
    document.getElementById('cc-handle').textContent = '@' + u.username;
    document.getElementById('cc-bio').textContent = u.bio || 'No bio yet.';
    document.getElementById('cc-art').textContent = u.submission_count || 0;
    document.getElementById('cc-rating').textContent = u.avg_rating ? Number(u.avg_rating).toFixed(1) : '—';

    document.getElementById('cc-view-btn').onclick = () => navigateTo('profile', { id: userId });

    const stage = document.getElementById('creators-stage');
    const sr = stage.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    let left = er.left - sr.left + 20;
    let top = er.top - sr.top - 20;
    if (left + 230 > stage.offsetWidth) left = stage.offsetWidth - 235;
    if (top + 240 > stage.offsetHeight) top = stage.offsetHeight - 260;
    if (top < 0) top = 10;

    card.style.left = left + 'px';
    card.style.top = top + 'px';
    card.style.display = 'block';
    requestAnimationFrame(() => card.classList.add('visible'));
}

function closeCreatorCard() {
    const card = document.getElementById('creator-card');
    card.classList.remove('visible');
    setTimeout(() => { card.style.display = 'none'; }, 250);
}

// ============================================
// MESSAGE FUNCTIONS
// ============================================
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

// ============================================
// AUTH FUNCTIONS
// ============================================
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
    } else {
        authLinks.style.display = 'flex';
        userLinks.style.display = 'none';
    }
}

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

function logoutUser() {
    removeToken();
    removeCurrentUser();
    updateNav();
    navigateTo('home');
    showMessage('Logged out successfully', 'info');
}

// ============================================
// PAGE TEMPLATES
// ============================================
const pages = {
    home: renderHome,
    login: renderLogin,
    register: renderRegister,
    submit: renderSubmit,
    jams: renderJams,
    profile: renderProfile,
    editprofile: renderEditProfile,
    detail: renderDetail
};

// ============================================
// NAVIGATION
// ============================================
async function navigateTo(page, params = {}) {
    if (isNavigating) return;
    isNavigating = true;

    currentPage = page;
    currentParams = params;

    const hash = page === 'home' ? '' : page;
    
    window.removeEventListener('hashchange', handleHash);
    window.location.hash = hash;
    setTimeout(() => {
        window.addEventListener('hashchange', handleHash);
    }, 100);

    const protectedPages = ['submit', 'profile', 'editprofile', 'detail'];
    if (protectedPages.includes(page) && !isAuthenticated()) {
        showMessage('Please log in to access this page', 'error');
        isNavigating = false;
        return renderLogin();
    }

    if (pages[page]) {
        await pages[page](params);
    } else {
        await renderHome();
    }

    updateNav();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    setTimeout(() => {
        isNavigating = false;
    }, 200);
}

// ============================================
// ROUTE HANDLING
// ============================================
function handleHash() {
    if (isNavigating) return;
    
    const hash = window.location.hash.replace('#', '');
    if (hash) {
        const [page, ...params] = hash.split('/');
        if (pages[page]) {
            const paramObj = {};
            params.forEach((p, i) => {
                if (i === 0 && page === 'detail') {
                    paramObj.id = p;
                    if (params.length > 1) paramObj.type = params[1];
                }
            });
            currentPage = page;
            pages[page](paramObj);
        }
    } else {
        navigateTo('home');
    }
}

// ============================================
// HANDLE FOLLOW / UNFOLLOW
// ============================================
async function handleFollow(userId) {
    if (!isAuthenticated()) {
        return navigateTo('login');
    }

    // Check if already following
    const currentUser = getCurrentUser();
    const followingRes = await getFollowing(currentUser.id);
    const isFollowing = followingRes.ok && followingRes.data.following && followingRes.data.following.some(u => u.id === userId);

    let result;
    if (isFollowing) {
        // Unfollow
        result = await unfollowUser(userId);
    } else {
        // Follow
        result = await followUser(userId);
    }

    if (result.ok) {
        showMessage(isFollowing ? 'Unfollowed successfully' : 'Followed successfully!', 'success');
        
        // Update the button text immediately without full re-render
        const btn = document.querySelector('.profile-header .btn-primary, .profile-header .btn-secondary');
        if (btn) {
            btn.textContent = isFollowing ? 'Follow' : 'Unfollow';
            btn.className = isFollowing ? 'btn-primary' : 'btn-secondary';
        }

        // Update follower count
        const followerCount = document.getElementById('follower-count');
        if (followerCount) {
            const current = parseInt(followerCount.textContent) || 0;
            followerCount.textContent = isFollowing ? current - 1 : current + 1;
        }
    } else {
        showMessage(result.data.error || 'Could not update follow status', 'error');
    }
}

// ============================================
// HANDLE CHANGE PASSWORD
// ============================================
async function handleChangePassword(e) {
    e.preventDefault();

    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    // Validate
    if (newPassword !== confirmPassword) {
        showMessage('Passwords do not match', 'error');
        return;
    }

    if (newPassword.length < 8) {
        showMessage('Password must be at least 8 characters', 'error');
        return;
    }

    const result = await changePassword(currentPassword, newPassword);

    if (result.ok) {
        showMessage('Password changed successfully!', 'success');
        document.getElementById('current-password').value = '';
        document.getElementById('new-password').value = '';
        document.getElementById('confirm-password').value = '';
    } else {
        showMessage(result.data.error || 'Failed to change password', 'error');
    }
}

// ============================================
// ADMIN: RESET USER PASSWORD
// ============================================
async function handleAdminResetPassword(userId) {
    if (!confirm('Are you sure you want to reset this user\'s password?')) return;

    const newPassword = prompt('Enter new password (min 8 characters):');
    if (!newPassword || newPassword.length < 8) {
        showMessage('Password must be at least 8 characters', 'error');
        return;
    }

    const result = await adminResetPassword(userId, newPassword);

    if (result.ok) {
        showMessage(`Password reset successfully for ${result.data.user.username}`, 'success');
    } else {
        showMessage(result.data.error || 'Failed to reset password', 'error');
    }
}

// Login Page
function renderLogin() {
    if (isAuthenticated()) {
        return navigateTo('home');
    }

    const container = document.getElementById('page-content');
    container.innerHTML = `
        <div class="auth-page">
            <h2>Welcome Back</h2>
            <p class="subtitle">Log in to your ArtJam account</p>
            <form id="login-form" onsubmit="handleLogin(event)">
                <div class="form-group">
                    <label for="login-username">Username</label>
                    <input type="text" id="login-username" placeholder="Enter your username" required />
                </div>
                <div class="form-group">
                    <label for="login-password">Password</label>
                    <input type="password" id="login-password" placeholder="Enter your password" required />
                </div>
                <button type="submit" class="btn-primary" style="width: 100%;">Log In</button>
            </form>
            <div class="auth-footer">
                Don't have an account? <a href="#" onclick="navigateTo('register')">Sign Up</a>
            </div>
        </div>
    `;
}

// Register Page
function renderRegister() {
    if (isAuthenticated()) {
        return navigateTo('home');
    }

    const container = document.getElementById('page-content');
    container.innerHTML = `
        <div class="auth-page">
            <h2>Join ArtJam</h2>
            <p class="subtitle">Create your account and start sharing art</p>
            <form id="register-form" onsubmit="handleRegister(event)">
                <div class="form-group">
                    <label for="reg-username">Username</label>
                    <input type="text" id="reg-username" placeholder="Choose a username" required />
                </div>
                <div class="form-group">
                    <label for="reg-email">Email</label>
                    <input type="email" id="reg-email" placeholder="Enter your email" required />
                </div>
                <div class="form-group">
                    <label for="reg-password">Password</label>
                    <input type="password" id="reg-password" placeholder="Create a password (min 6 characters)" required minlength="6" />
                </div>
                <div class="form-group">
                    <label for="reg-displayname">Display Name (optional)</label>
                    <input type="text" id="reg-displayname" placeholder="How you want to be seen" />
                </div>
                <button type="submit" class="btn-primary" style="width: 100%;">Sign Up</button>
            </form>
            <div class="auth-footer">
                Already have an account? <a href="#" onclick="navigateTo('login')">Log In</a>
            </div>
        </div>
    `;
}

// Home - Discover Page
async function renderHome() {
    const container = document.getElementById('page-content');
    container.innerHTML = `<div class="loading">Loading art</div>`;

    try {
        const [subsResult, usersResult] = await Promise.all([
            getSubmissions('?limit=50'),
            getTopCreators()
        ]);

        const submissions = subsResult.ok ? subsResult.data.submissions || [] : [];
        const creators = usersResult.ok ? usersResult.data.users || [] : [];

        container.innerHTML = `
            <div class="home-hero">
                <div class="watermark">Discover Art</div>

                <div class="particles-container">
                    ${Array.from({ length: 10 }, (_, i) => `
                        <div class="particle particle-${i % 3}" 
                             style="left:${Math.random() * 90 + 5}%; 
                                    top:${Math.random() * 80 + 10}%;
                                    animation-duration:${7 + Math.random() * 7}s;
                                    animation-delay:${Math.random() * 5}s;
                                    width:${2 + Math.random() * 4}px;
                                    height:${2 + Math.random() * 4}px;">
                        </div>
                    `).join('')}
                </div>

                <div class="hero-content">
                    <p style="color:var(--text-secondary); margin-top:0.4rem;">
                        ${submissions.length} pieces from the community
                    </p>
                </div>

                <div class="creators-stage" id="creators-stage">
                    ${creators.map((u, i) => `
                        <div class="creator-bubble float-${(i % 6) + 1}"
                             style="left:${getBubbleX(i, creators.length)}%;
                                    top:${getBubbleY(i)}%;
                                    animation-delay:${(i * 0.15)}s;
                                    animation-duration:${5.5 + (i % 3) * 0.8}s;"
                             onclick="showCreatorCard(this, '${u.id}')">
                            <div class="bubble-avatar" style="background:${getBubbleColor(i)}">
                                ${(u.display_name || u.username).charAt(0).toUpperCase()}
                            </div>
                            <div class="bubble-name">
                                ${u.display_name || u.username}
                            </div>
                        </div>
                    `).join('')}
                    <div class="creator-card" id="creator-card" style="display:none">
                        <button class="creator-card-close" onclick="closeCreatorCard()">✕</button>
                        <div class="creator-card-avatar" id="cc-avatar"></div>
                        <h3 id="cc-name"></h3>
                        <div class="cc-handle" id="cc-handle"></div>
                        <div class="cc-bio" id="cc-bio"></div>
                        <div class="cc-stats">
                            <span><strong id="cc-art">0</strong> artworks</span>
                            <span><strong id="cc-rating">0</strong> avg rating</span>
                        </div>
                        <button class="btn-primary" style="width:100%;margin-top:0.75rem;padding:8px"
                            id="cc-view-btn">View Profile</button>
                    </div>
                </div>
            </div>

            <div class="submissions-grid">
                ${submissions.length === 0
                    ? `<p style="grid-column:1/-1;text-align:center;padding:3rem 0;color:var(--text-muted)">
                         No art yet. <a href="#" onclick="navigateTo('submit')" style="color:var(--accent)">Be the first!</a>
                       </p>`
                    : submissions.map(sub => `
                        <div class="submission-card" onclick="navigateTo('detail',{id:'${sub.id}'})">
                            <div class="image-wrapper">
                                <img src="${fixImageUrl(sub.image_url)}"
                                     alt="${sub.title}" loading="lazy" />
                            </div>
                            <div class="card-content">
                                <h3>${sub.title}</h3>
                                <p style="font-size:0.82rem;color:var(--text-secondary);
                                          display:-webkit-box;-webkit-line-clamp:2;
                                          -webkit-box-orient:vertical;overflow:hidden;">
                                    ${sub.description || ''}
                                </p>
                                <div class="card-meta">
                                    <span class="user">
                                        <span class="avatar">
                                            ${sub.User
                                                ? (sub.User.display_name || sub.User.username).charAt(0)
                                                : '?'}
                                        </span>
                                        ${sub.User
                                            ? sub.User.display_name || sub.User.username
                                            : 'Unknown'}
                                    </span>
                                    <span class="rating">
                                        ${sub.avg_rating > 0
                                            ? '★' + Number(sub.avg_rating).toFixed(1)
                                            : '☆ 0'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
            </div>
        `;

        window._creators = {};
        creators.forEach(u => { window._creators[u.id] = u; });

    } catch(err) {
        console.error(err);
        container.innerHTML = `
            <div class="error-page">
                <h2>Oops!</h2>
                <p>Could not connect to the server.</p>
                <button class="btn-primary" onclick="renderHome()">Retry</button>
            </div>`;
    }
}

// Submit Page
async function renderSubmit() {
    if (!isAuthenticated()) {
        return navigateTo('login');
    }

    const jamsResult = await getJams();
    let jamOptions = '';
    if (jamsResult.ok && jamsResult.data.jams) {
        jamOptions = jamsResult.data.jams
            .filter(j => j.status === 'active')
            .map(j => `<option value="${j.id}">${j.title}</option>`)
            .join('');
    }

    const container = document.getElementById('page-content');
    container.innerHTML = `
        <div class="submit-page">
            <h2>Share Your <span>Art</span></h2>
            <p class="subtitle">Upload your artwork to the community</p>
            <form id="submit-form" onsubmit="handleSubmit(event)" enctype="multipart/form-data">
                <div class="form-group">
                    <label for="sub-title">Title</label>
                    <input type="text" id="sub-title" placeholder="Give your art a title" required />
                </div>
                <div class="form-group">
                    <label for="sub-description">Description</label>
                    <textarea id="sub-description" placeholder="Tell us about your artwork..."></textarea>
                </div>
                <div class="form-group">
                    <label for="sub-jam">Submit to a Jam (optional)</label>
                    <select id="sub-jam">
                        <option value="">Not in a jam</option>
                        ${jamOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label>Image</label>
                    <div class="file-upload" onclick="document.getElementById('sub-image').click()">
                        <div class="file-label">
                            <span class="icon">🖼️</span>
                            <span id="file-label-text">Click to upload an image</span>
                            <br /><small style="color: var(--text-muted);">PNG, JPG, GIF, WEBP (max 5MB)</small>
                        </div>
                        <input type="file" id="sub-image" accept="image/*" required 
                            onclick="event.stopPropagation()"  
                            onchange="handleFileSelect(this)" />
                        <div id="image-preview-container"></div>
                    </div>
                </div>
                <button type="submit" class="btn-primary" style="width: 100%;">Submit Art</button>
            </form>
        </div>
    `;
}

// Jams Page
async function renderJams() {
    const container = document.getElementById('page-content');

    container.innerHTML = `<div class="loading">Loading jams</div>`;

    try {
        const result = await getJams();

        if (result.ok) {
            const jams = result.data.jams || [];

            let html = `
                <div class="jams-page">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                        <div>
                            <h2>Art <span>Jams</span></h2>
                            <p style="color: var(--text-secondary);">Competitions and challenges</p>
                        </div>
                        ${isAuthenticated() ? `
                            <button class="btn-primary" onclick="renderCreateJam()">Create Jam</button>
                        ` : ''}
                    </div>
                    <div class="jams-grid">
            `;

            if (jams.length === 0) {
                html += `<p style="grid-column: 1/-1; text-align: center; padding: 3rem 0; color: var(--text-muted);">
                            No jams yet. Check back later!
                        </p>`;
            } else {
                jams.forEach(jam => {
                    const statusClass = jam.status || 'draft';
                    html += `
                        <div class="jam-card" onclick="navigateTo('detail', { id: '${jam.id}', type: 'jam' })">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                                <h3>${jam.title}</h3>
                                <span class="jam-status ${statusClass}">${statusClass}</span>
                            </div>
                            <p style="font-size: 0.9rem; color: var(--text-secondary); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                                ${jam.description || ''}
                            </p>
                            <div class="jam-meta">
                                <span>📅 ${new Date(jam.start_date).toLocaleDateString()} - ${new Date(jam.end_date).toLocaleDateString()}</span>
                                <span>${jam.submission_count || 0} submissions</span>
                            </div>
                            <div style="font-size: 0.8rem; color: var(--text-secondary);">
                                by ${jam.User ? jam.User.display_name || jam.User.username : 'Unknown'}
                            </div>
                        </div>
                    `;
                });
            }

            html += `
                    </div>
                </div>
            `;

            container.innerHTML = html;
        } else {
            container.innerHTML = `<p>Could not load jams: ${result.data.error}</p>`;
        }
    } catch (error) {
        container.innerHTML = `<p>Error loading jams. Is the server running?</p>`;
    }
}

// Profile Page
async function renderProfile(params = {}) {
    const container = document.getElementById('page-content');
    
    // Check if we're viewing own profile or someone else's
    const viewingOwnProfile = !params.id || 
        (getCurrentUser() && params.id === getCurrentUser().id);

    let user;
    if (viewingOwnProfile) {
        if (!isAuthenticated()) {
            return navigateTo('login');
        }
        user = getCurrentUser();
    } else {
        // Fetch other user's profile
        const result = await getUserProfile(params.id);
        if (!result.ok) {
            container.innerHTML = `
                <div class="error-page">
                    <h2>User not found</h2>
                    <p>${result.data.error || 'The user you\'re looking for doesn\'t exist.'}</p>
                    <button class="btn-primary" onclick="navigateTo('home')">Go Home</button>
                </div>`;
            return;
        }
        user = result.data.user;
    }

    // Check if already following this user (only if not viewing own profile)
    let isFollowing = false;
    if (!viewingOwnProfile && isAuthenticated()) {
        const currentUser = getCurrentUser();
        const followingRes = await getFollowing(currentUser.id);
        if (followingRes.ok && followingRes.data.following) {
            isFollowing = followingRes.data.following.some(u => u.id === user.id);
        }
    }

    const avatarUrl = user.avatar_url ? fixImageUrl(user.avatar_url) : '';

    container.innerHTML = `
        <div class="profile-page">
            <div class="profile-header">
                <div class="avatar-large">
                    ${avatarUrl 
                        ? `<img src="${avatarUrl}" alt="${user.display_name || user.username}" />` 
                        : (user.display_name || user.username).charAt(0).toUpperCase()}
                </div>
                <div class="profile-info">
                    <h2>${user.display_name || user.username}</h2>
                    <p class="bio">${user.bio || 'No bio yet'}</p>
                    
                    <!-- Social Links -->
                    <div class="social-links">
                        ${user.instagram ? `<a href="https://instagram.com/${user.instagram}" target="_blank" class="social-link instagram">📷 Instagram</a>` : ''}
                        ${user.tiktok ? `<a href="https://tiktok.com/@${user.tiktok}" target="_blank" class="social-link tiktok">🎵 TikTok</a>` : ''}
                        ${user.twitter ? `<a href="https://twitter.com/${user.twitter}" target="_blank" class="social-link twitter">🐦 Twitter</a>` : ''}
                        ${user.website ? `<a href="${user.website}" target="_blank" class="social-link website">🌐 Website</a>` : ''}
                    </div>

                    <div class="stats">
                        <span>📸 <span id="submission-count">0</span> submissions</span>
                        <span>👥 <span id="follower-count">0</span> followers</span>
                        <span>👤 <span id="following-count">0</span> following</span>
                    </div>
                    
                    ${viewingOwnProfile ? `
                        <button class="btn-secondary" style="margin-top: 1rem; padding: 8px 20px; font-size: 0.75rem;" onclick="navigateTo('editprofile')">
                            ✏️ Edit Profile
                        </button>
                    ` : `
                        <button class="${isFollowing ? 'btn-secondary' : 'btn-primary'}" style="margin-top: 1rem; padding: 8px 20px; font-size: 0.75rem;" onclick="handleFollow('${user.id}')">
                            ${isFollowing ? 'Unfollow' : 'Follow'}
                        </button>
                    `}
                </div>
            </div>
            <h3>${viewingOwnProfile ? 'My' : (user.display_name || user.username) + "'s"} Submissions</h3>
            <div id="profile-submissions" class="submissions-grid">
                <div class="loading">Loading art...</div>
            </div>
        </div>
    `;

    // Load user's submissions
    try {
        const result = await getSubmissions(`?user_id=${user.id}&limit=50`);
        const grid = document.getElementById('profile-submissions');

        if (result.ok && result.data.submissions && result.data.submissions.length > 0) {
            let html = '';
            result.data.submissions.forEach(sub => {
                const imageUrl = fixImageUrl(sub.image_url);
                const rating = sub.avg_rating || 0;
                html += `
                    <div class="submission-card" onclick="navigateTo('detail', { id: '${sub.id}' })">
                        <div class="image-wrapper">
                            <img src="${imageUrl}" alt="${sub.title}" loading="lazy" />
                        </div>
                        <div class="card-content">
                            <h3>${sub.title}</h3>
                            <div class="card-meta">
                                <span>${rating > 0 ? '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating)) : '☆ 0'}</span>
                                <span style="font-size: 0.75rem; color: var(--text-muted);">${new Date(sub.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                `;
            });
            grid.innerHTML = html;
            document.getElementById('submission-count').textContent = result.data.submissions.length;
        } else {
            grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; padding: 2rem 0; color: var(--text-muted);">
                                ${viewingOwnProfile ? 'You haven\'t submitted any art yet. <a href="#" onclick="navigateTo(\'submit\')" style="color: var(--accent);">Submit something!</a>' : 'No submissions yet.'}
                            </p>`;
        }
    } catch (error) {
        document.getElementById('profile-submissions').innerHTML = `<p>Could not load submissions</p>`;
    }

    // Load followers/following counts
    try {
        const [followersRes, followingRes] = await Promise.all([
            getFollowers(user.id),
            getFollowing(user.id)
        ]);

        if (followersRes.ok) {
            document.getElementById('follower-count').textContent = followersRes.data.count || 0;
        }
        if (followingRes.ok) {
            document.getElementById('following-count').textContent = followingRes.data.count || 0;
        }
    } catch (error) {
        // ignore
    }
}

// ============================================
// EDIT PROFILE PAGE with Avatar Upload + Password Change
// ============================================
function renderEditProfile() {
    if (!isAuthenticated()) {
        return navigateTo('login');
    }

    const user = getCurrentUser();
    const container = document.getElementById('page-content');
    const avatarUrl = user.avatar_url ? fixImageUrl(user.avatar_url) : '';

    container.innerHTML = `
        <div class="auth-page">
            <h2>Edit <span>Profile</span></h2>
            <p class="subtitle">Update your profile information</p>

            <!-- Avatar Upload Section -->
            <div class="avatar-upload-section">
                <div class="avatar-preview">
                    ${avatarUrl 
                        ? `<img src="${avatarUrl}" alt="Avatar" id="avatar-preview-img" />` 
                        : `<div class="avatar-placeholder" id="avatar-preview-img">${(user.display_name || user.username).charAt(0).toUpperCase()}</div>`}
                </div>
                <div class="avatar-upload-btn">
                    <label for="avatar-upload" class="btn-secondary" style="cursor:pointer;padding:6px 16px;font-size:0.75rem;">
                        📷 Change Photo
                    </label>
                    <input type="file" id="avatar-upload" accept="image/*" style="display:none" onchange="handleAvatarUpload(event)" />
                </div>
                <small style="color: var(--text-muted); font-size: 0.7rem;">Max 2MB · JPG, PNG, GIF, WEBP</small>
            </div>

            <form id="edit-profile-form" onsubmit="handleUpdateProfile(event)">
                <div class="form-group">
                    <label for="edit-displayname">Display Name</label>
                    <input type="text" id="edit-displayname" value="${user.display_name || ''}" placeholder="Your display name" />
                </div>
                <div class="form-group">
                    <label for="edit-bio">Bio</label>
                    <textarea id="edit-bio" placeholder="Tell us about yourself...">${user.bio || ''}</textarea>
                </div>
                <div class="form-group">
                    <label for="edit-instagram">Instagram Username</label>
                    <input type="text" id="edit-instagram" value="${user.instagram || ''}" placeholder="@username" />
                </div>
                <div class="form-group">
                    <label for="edit-tiktok">TikTok Username</label>
                    <input type="text" id="edit-tiktok" value="${user.tiktok || ''}" placeholder="@username" />
                </div>
                <div class="form-group">
                    <label for="edit-twitter">Twitter/X Username</label>
                    <input type="text" id="edit-twitter" value="${user.twitter || ''}" placeholder="@username" />
                </div>
                <div class="form-group">
                    <label for="edit-website">Website URL</label>
                    <input type="url" id="edit-website" value="${user.website || ''}" placeholder="https://yourwebsite.com" />
                </div>
                <button type="submit" class="btn-primary" style="width: 100%;">Save Profile</button>
                <button type="button" class="btn-secondary" style="width: 100%; margin-top: 0.5rem;" onclick="navigateTo('profile')">Cancel</button>
            </form>

            <!-- ===== PASSWORD CHANGE SECTION ===== -->
            <hr style="border-color: var(--border); margin: 1.5rem 0;" />
            <h3 style="text-align: center; font-size: 1.2rem; margin-bottom: 1rem;">Change Password</h3>
            <form id="change-password-form" onsubmit="handleChangePassword(event)">
                <div class="form-group">
                    <label for="current-password">Current Password</label>
                    <input type="password" id="current-password" placeholder="Enter current password" required />
                </div>
                <div class="form-group">
                    <label for="new-password">New Password</label>
                    <input type="password" id="new-password" placeholder="Min 8 characters" required minlength="8" />
                </div>
                <div class="form-group">
                    <label for="confirm-password">Confirm New Password</label>
                    <input type="password" id="confirm-password" placeholder="Confirm new password" required minlength="8" />
                </div>
                <button type="submit" class="btn-primary" style="width: 100%; background: var(--accent-2);">Change Password</button>
            </form>
        </div>
    `;
}

// ============================================
// HANDLE AVATAR UPLOAD
// ============================================
async function handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
        showMessage('Avatar must be less than 2MB', 'error');
        return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        showMessage('Please upload a valid image (PNG, JPG, GIF, WEBP)', 'error');
        return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    const result = await updateAvatar(formData);

    if (result.ok) {
        // Update local storage with new avatar URL
        const user = getCurrentUser();
        const updatedUser = { ...user, avatar_url: result.data.avatar_url };
        setCurrentUser(updatedUser);

        // Update preview
        const preview = document.getElementById('avatar-preview-img');
        if (preview) {
            if (preview.tagName === 'IMG') {
                preview.src = fixImageUrl(result.data.avatar_url);
            } else {
                // If it's a div placeholder, replace with img
                const parent = preview.parentElement;
                const img = document.createElement('img');
                img.id = 'avatar-preview-img';
                img.src = fixImageUrl(result.data.avatar_url);
                img.alt = 'Avatar';
                parent.replaceChild(img, preview);
            }
        }

        showMessage('Avatar updated successfully!', 'success');
    } else {
        showMessage(result.data.error || 'Could not update avatar', 'error');
    }
}

// ============================================
// HANDLE UPDATE PROFILE
// ============================================
async function handleUpdateProfile(e) {
    e.preventDefault();

    const display_name = document.getElementById('edit-displayname').value.trim();
    const bio = document.getElementById('edit-bio').value.trim();
    const instagram = document.getElementById('edit-instagram').value.trim().replace('@', '');
    const tiktok = document.getElementById('edit-tiktok').value.trim().replace('@', '');
    const twitter = document.getElementById('edit-twitter').value.trim().replace('@', '');
    const website = document.getElementById('edit-website').value.trim();

    const result = await updateProfile({
        display_name,
        bio,
        instagram,
        tiktok,
        twitter,
        website
    });

    if (result.ok) {
        // Update local storage
        const user = getCurrentUser();
        const updatedUser = { ...user, ...result.data.user };
        setCurrentUser(updatedUser);
        
        showMessage('Profile updated successfully!', 'success');
        navigateTo('profile');
    } else {
        showMessage(result.data.error || 'Could not update profile', 'error');
    }
}

// Detail Page (Submission or Jam)
async function renderDetail(params) {
    const container = document.getElementById('page-content');

    if (params.type === 'jam') {
        return renderJamDetail(params.id);
    }

    const id = params.id;
    if (!id) {
        return navigateTo('home');
    }

    container.innerHTML = `<div class="loading">Loading art</div>`;

    try {
        const result = await getSubmission(id);

        if (!result.ok) {
            container.innerHTML = `
                <div class="detail-page">
                    <h2>Art not found</h2>
                    <p>${result.data.error || 'The submission you\'re looking for doesn\'t exist.'}</p>
                    <button class="btn-primary" onclick="navigateTo('home')">Go Home</button>
                </div>
            `;
            return;
        }

        const sub = result.data;
        const imageUrl = fixImageUrl(sub.image_url);
        const rating = sub.avg_rating || 0;

        const commentsResult = await getSubmissionComments(id);
        const comments = commentsResult.ok ? commentsResult.data.comments || [] : [];

        const user = getCurrentUser();
        const canEdit = user && (user.id === sub.user_id || user.role === 'admin');

        let userVote = null;
        if (isAuthenticated()) {
            const votesResult = await getSubmissionVotes(id);
            if (votesResult.ok && votesResult.data.votes) {
                const found = votesResult.data.votes.find(v => v.user_id === user.id);
                if (found) userVote = found.value;
            }
        }

        let html = `
            <div class="detail-page">
                <!-- Full width image -->
                <div class="detail-image-full">
                    <img src="${imageUrl}" alt="${sub.title}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22800%22 height=%22600%22%3E%3Crect fill=%22%231a1a1a%22 width=%22800%22 height=%22600%22/%3E%3Ctext x=%2250%%22 y=%2250%%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%235a5a5a%22 font-family=%22Inter%22 font-size=%2220%22%3ENo Image%3C/text%3E%3C/svg%3E'" />
                </div>
                
                <!-- Content below image -->
                <div class="detail-content">
                    <div class="detail-header">
                        <div>
                            <h1>${sub.title}</h1>
                            <div class="detail-meta">
                                <span>by ${sub.User ? sub.User.display_name || sub.User.username : 'Unknown'}</span>
                                <span>📅 ${new Date(sub.created_at).toLocaleDateString()}</span>
                                ${sub.jam_id ? `<span>🏆 In a jam</span>` : ''}
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 2rem; color: var(--accent);">
                                ${'★'.repeat(Math.round(rating))}${'☆'.repeat(5 - Math.round(rating))}
                            </div>
                            <div style="font-size: 0.8rem; color: var(--text-secondary);">
                                ${sub.vote_count || 0} votes · ${rating > 0 ? rating.toFixed(1) : '0'} avg
                            </div>
                        </div>
                    </div>

                    <div class="detail-description">
                        <p>${sub.description || 'No description provided.'}</p>
                    </div>

                    <div class="detail-actions">
                        ${isAuthenticated() && sub.user_id !== user?.id ? `
                            <div style="display: flex; gap: 0.5rem; align-items: center;">
                                <span style="color: var(--text-secondary); font-size: 0.8rem;">Rate:</span>
                                ${[1,2,3,4,5].map(v => `
                                    <button class="btn-secondary" style="padding: 4px 12px; ${userVote === v ? 'background: var(--accent); color: #0a0a0a; border-color: var(--accent);' : ''}"
                                        onclick="handleVote('${sub.id}', ${v})">
                                        ${v}
                                    </button>
                                `).join('')}
                            </div>
                        ` : ''}
                        ${canEdit ? `
                            <button class="btn-secondary" onclick="handleDeleteSubmission('${sub.id}')">Delete</button>
                        ` : ''}
                    </div>

                    <div class="comments-section">
                        <h3>Comments (${comments.length})</h3>
                        ${isAuthenticated() ? `
                            <div class="comment-form">
                                <input type="text" id="comment-input" placeholder="Add a comment..." />
                                <button class="btn-primary" style="padding: 10px 20px;" onclick="handleComment('${sub.id}')">Post</button>
                            </div>
                        ` : `
                            <p style="color: var(--text-secondary);"><a href="#" onclick="navigateTo('login')" style="color: var(--accent);">Log in</a> to comment</p>
                        `}
                        <div id="comments-list">
        `;

        if (comments.length === 0) {
            html += `<p style="color: var(--text-muted); padding: 1rem 0;">No comments yet. Be the first!</p>`;
        } else {
            comments.forEach(comment => {
                const userLiked = comment.CommentLikes ? comment.CommentLikes.some(l => l.user_id === user?.id && l.type === 'like') : false;
                const userDisliked = comment.CommentLikes ? comment.CommentLikes.some(l => l.user_id === user?.id && l.type === 'dislike') : false;
                
                html += `
                    <div class="comment" id="comment-${comment.id}">
                        <div class="comment-header">
                            <span class="comment-user">${comment.User ? comment.User.display_name || comment.User.username : 'Unknown'}</span>
                            <span style="font-size: 0.7rem;">${new Date(comment.created_at).toLocaleDateString()}</span>
                        </div>
                        <div class="comment-content">${comment.content}</div>
                        <div class="comment-actions">
                            <button class="comment-btn like-btn ${userLiked ? 'active' : ''}" onclick="handleCommentLike('${comment.id}', 'like')">
                                👍 <span class="like-count">${comment.likes || 0}</span>
                            </button>
                            <button class="comment-btn dislike-btn ${userDisliked ? 'active' : ''}" onclick="handleCommentLike('${comment.id}', 'dislike')">
                                👎 <span class="dislike-count">${comment.dislikes || 0}</span>
                            </button>
                            <button class="comment-btn reply-btn" onclick="toggleReplyForm('${comment.id}')">💬 Reply</button>
                            ${comment.user_id === user?.id ? `
                                <button class="comment-btn delete-btn" onclick="handleDeleteComment('${comment.id}')">🗑️ Delete</button>
                            ` : ''}
                            ${user ? `
                                <button class="comment-btn report-btn" onclick="handleReportComment('${comment.id}')">🚩 Report</button>
                            ` : ''}
                        </div>
                        <div id="reply-form-${comment.id}" class="reply-form" style="display: none; margin-top: 0.5rem;">
                            <div class="comment-form" style="display: flex; gap: 0.5rem;">
                                <input type="text" id="reply-input-${comment.id}" placeholder="Write a reply..." style="flex: 1; padding: 8px 12px; background: var(--bg-elevated); border: 1px solid var(--border); border-radius: 6px; color: var(--text-primary);" />
                                <button class="btn-primary" style="padding: 8px 16px; font-size: 0.8rem;" onclick="handleReply('${sub.id}', '${comment.id}')">Reply</button>
                                <button class="btn-secondary" style="padding: 8px 16px; font-size: 0.8rem;" onclick="toggleReplyForm('${comment.id}')">Cancel</button>
                            </div>
                        </div>
                        ${comment.Comments && comment.Comments.length > 0 ? comment.Comments.map(reply => `
                            <div class="comment reply" style="margin-left: 2rem; border-left: 2px solid var(--border); padding-left: 1rem;">
                                <div class="comment-header">
                                    <span class="comment-user">${reply.User ? reply.User.display_name || reply.User.username : 'Unknown'}</span>
                                    <span style="font-size: 0.7rem;">${new Date(reply.created_at).toLocaleDateString()}</span>
                                </div>
                                <div class="comment-content">${reply.content}</div>
                                <div class="comment-actions" style="font-size: 0.75rem;">
                                    ${reply.user_id === user?.id ? `
                                        <button class="comment-btn delete-btn" onclick="handleDeleteComment('${reply.id}')">🗑️ Delete</button>
                                    ` : ''}
                                </div>
                            </div>
                        `).join('') : ''}
                    </div>
                `;
            });
        }

        html += `
                        </div>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;

    } catch (error) {
        container.innerHTML = `
            <div class="detail-page">
                <h2>Error</h2>
                <p>Could not load this artwork.</p>
                <button class="btn-primary" onclick="navigateTo('home')">Go Home</button>
            </div>
        `;
    }
}

// Jam Detail
async function renderJamDetail(id) {
    const container = document.getElementById('page-content');
    container.innerHTML = `<div class="loading">Loading jam</div>`;

    try {
        const result = await getJam(id);

        if (!result.ok) {
            container.innerHTML = `<p>Jam not found</p>`;
            return;
        }

        const jam = result.data;

        let html = `
            <div class="detail-page">
                <h1>${jam.title}</h1>
                <div class="detail-meta">
                    <span>📅 ${new Date(jam.start_date).toLocaleDateString()} - ${new Date(jam.end_date).toLocaleDateString()}</span>
                    <span>🏷️ ${jam.theme || 'No theme'}</span>
                    <span>📊 ${jam.submission_count || 0} submissions</span>
                </div>
                <div class="detail-description">
                    <p>${jam.description || 'No description provided.'}</p>
                </div>
                <h3>Submissions</h3>
                <div class="submissions-grid">
        `;

        if (jam.Submissions && jam.Submissions.length > 0) {
            jam.Submissions.forEach(sub => {
                const imageUrl = fixImageUrl(sub.image_url);
                html += `
                    <div class="submission-card" onclick="navigateTo('detail', { id: '${sub.id}' })">
                        <div class="image-wrapper">
                            <img src="${imageUrl}" alt="${sub.title}" loading="lazy" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%231a1a1a%22 width=%22200%22 height=%22200%22/%3E%3Ctext x=%2250%%22 y=%2250%%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%235a5a5a%22 font-family=%22Inter%22 font-size=%2214%22%3ENo Image%3C/text%3E%3C/svg%3E'" />
                        </div>
                        <div class="card-content">
                            <h3>${sub.title}</h3>
                            <div class="card-meta">
                                <span class="user">
                                    <span class="avatar">${sub.User ? (sub.User.display_name || sub.User.username).charAt(0) : '?'}</span>
                                    ${sub.User ? sub.User.display_name || sub.User.username : 'Unknown'}
                                </span>
                            </div>
                        </div>
                    </div>
                `;
            });
        } else {
            html += `<p style="grid-column: 1/-1; text-align: center; padding: 2rem 0; color: var(--text-muted);">No submissions yet for this jam.</p>`;
        }

        html += `
                </div>
            </div>
        `;

        container.innerHTML = html;

    } catch (error) {
        container.innerHTML = `<p>Error loading jam</p>`;
    }
}

// ============================================
// INTERACTIONS
// ============================================

// Handle vote
async function handleVote(submissionId, value) {
    if (!isAuthenticated()) {
        return navigateTo('login');
    }

    const result = await castVote(submissionId, value);

    if (result.ok) {
        showMessage('Vote recorded!', 'success');
        renderDetail({ id: submissionId });
    } else {
        showMessage(result.data.error || 'Could not cast vote', 'error');
    }
}

// Handle comment
async function handleComment(submissionId) {
    const input = document.getElementById('comment-input');
    const content = input.value.trim();

    if (!content) {
        return showMessage('Please write a comment', 'error');
    }

    const result = await createComment(submissionId, content);

    if (result.ok) {
        input.value = '';
        showMessage('Comment added!', 'success');
        renderDetail({ id: submissionId });
    } else {
        showMessage(result.data.error || 'Could not post comment', 'error');
    }
}

// Handle reply to comment
async function handleReply(submissionId, parentId) {
    const input = document.getElementById(`reply-input-${parentId}`);
    const content = input.value.trim();

    if (!content) {
        return showMessage('Please write a reply', 'error');
    }

    const result = await createComment(submissionId, content, parentId);

    if (result.ok) {
        input.value = '';
        showMessage('Reply added!', 'success');
        renderDetail({ id: submissionId });
    } else {
        showMessage(result.data.error || 'Could not post reply', 'error');
    }
}

// Toggle reply form visibility
function toggleReplyForm(commentId) {
    const form = document.getElementById(`reply-form-${commentId}`);
    if (form) {
        form.style.display = form.style.display === 'none' ? 'block' : 'none';
    }
}

// Handle comment like/dislike
async function handleCommentLike(commentId, type) {
    if (!isAuthenticated()) {
        return navigateTo('login');
    }

    const result = await apiRequest(`/comments/${commentId}/like`, {
        method: 'POST',
        body: JSON.stringify({ type })
    });

    if (result.ok) {
        renderDetail({ id: currentParams.id });
    } else {
        showMessage(result.data.error || 'Could not update reaction', 'error');
    }
}

// Handle delete comment
async function handleDeleteComment(commentId) {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    const result = await deleteComment(commentId);

    if (result.ok) {
        showMessage('Comment deleted', 'info');
        renderDetail({ id: currentParams.id });
    } else {
        showMessage(result.data.error || 'Could not delete comment', 'error');
    }
}

// Handle report comment
async function handleReportComment(commentId) {
    if (!isAuthenticated()) {
        return navigateTo('login');
    }

    const reason = prompt('Please explain why you are reporting this comment:');
    if (!reason || reason.trim() === '') {
        return showMessage('Report cancelled', 'info');
    }

    const result = await apiRequest(`/comments/${commentId}/report`, {
        method: 'POST',
        body: JSON.stringify({ reason: reason.trim() })
    });

    if (result.ok) {
        showMessage('Comment reported. Thank you for helping keep our community safe!', 'success');
    } else {
        showMessage(result.data.error || 'Could not report comment', 'error');
    }
}

// Handle submit
async function handleSubmit(e) {
    e.preventDefault();

    const title = document.getElementById('sub-title').value.trim();
    const description = document.getElementById('sub-description').value.trim();
    const jamId = document.getElementById('sub-jam').value;
    const imageFile = document.getElementById('sub-image').files[0];

    if (!title) {
        return showMessage('Please enter a title', 'error');
    }

    if (!imageFile) {
        return showMessage('Please select an image', 'error');
    }

    if (imageFile.size > 5 * 1024 * 1024) {
        return showMessage('Image must be less than 5MB', 'error');
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(imageFile.type)) {
        return showMessage('Please upload a valid image (PNG, JPG, GIF, WEBP)', 'error');
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    if (jamId) formData.append('jam_id', jamId);
    formData.append('image', imageFile);

    const result = await createSubmission(formData);

    if (result.ok) {
        showMessage('Art submitted successfully! 🎨', 'success');
        setTimeout(() => navigateTo('home'), 500);
    } else {
        showMessage(result.data.error || 'Could not submit art', 'error');
    }
}

// Handle delete submission
async function handleDeleteSubmission(id) {
    if (!confirm('Are you sure you want to delete this submission?')) return;

    const result = await deleteSubmission(id);

    if (result.ok) {
        showMessage('Submission deleted', 'info');
        navigateTo('home');
    } else {
        showMessage(result.data.error || 'Could not delete', 'error');
    }
}

// Handle file selection with preview
function handleFileSelect(input) {
    const file = input.files[0];
    if (!file) return;
    
    const label = document.getElementById('file-label-text');
    const wrapper = document.querySelector('.file-upload');
    const previewContainer = document.getElementById('image-preview-container');
    
    label.textContent = `✓ ${file.name}`;
    wrapper.style.borderColor = 'var(--accent)';
    
    previewContainer.innerHTML = '';
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const preview = document.createElement('img');
        preview.src = e.target.result;
        preview.style.cssText = `
            width: 100%;
            max-height: 200px;
            object-fit: contain;
            margin-top: 1rem;
            border-radius: 4px;
        `;
        previewContainer.appendChild(preview);
    };
    reader.readAsDataURL(file);
}

// Render Create Jam form
function renderCreateJam() {
    if (!isAuthenticated()) {
        return navigateTo('login');
    }

    const container = document.getElementById('page-content');
    container.innerHTML = `
        <div class="submit-page">
            <h2>Create a <span>Jam</span></h2>
            <p class="subtitle">Start a new art competition</p>
            <form id="jam-form" onsubmit="handleCreateJam(event)">
                <div class="form-group">
                    <label for="jam-title">Title</label>
                    <input type="text" id="jam-title" placeholder="Jam title" required />
                </div>
                <div class="form-group">
                    <label for="jam-description">Description</label>
                    <textarea id="jam-description" placeholder="Describe your jam..." required></textarea>
                </div>
                <div class="form-group">
                    <label for="jam-theme">Theme (optional)</label>
                    <input type="text" id="jam-theme" placeholder="Art theme..." />
                </div>
                <div class="form-group">
                    <label for="jam-start">Start Date</label>
                    <input type="datetime-local" id="jam-start" required />
                </div>
                <div class="form-group">
                    <label for="jam-end">End Date</label>
                    <input type="datetime-local" id="jam-end" required />
                </div>
                <button type="submit" class="btn-primary" style="width: 100%;">Create Jam</button>
            </form>
        </div>
    `;
}

// Handle create jam
async function handleCreateJam(e) {
    e.preventDefault();

    const title = document.getElementById('jam-title').value.trim();
    const description = document.getElementById('jam-description').value.trim();
    const theme = document.getElementById('jam-theme').value.trim();
    const start_date = document.getElementById('jam-start').value;
    const end_date = document.getElementById('jam-end').value;

    if (!title || !description || !start_date || !end_date) {
        return showMessage('Please fill in all required fields', 'error');
    }

    const result = await apiRequest('/jams', {
        method: 'POST',
        body: JSON.stringify({ title, description, theme, start_date, end_date })
    });

    if (result.ok) {
        showMessage('Jam created successfully! 🏆', 'success');
        navigateTo('jams');
    } else {
        showMessage(result.data.error || 'Could not create jam', 'error');
    }
}

// ============================================
// INIT
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('loaded');
    updateNav();
    handleHash();
    window.addEventListener('hashchange', handleHash);
});

window.navigateTo = navigateTo;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.handleSubmit = handleSubmit;
window.handleFollow = handleFollow;
window.handleChangePassword = handleChangePassword;
window.handleAdminResetPassword = handleAdminResetPassword;
window.handleVote = handleVote;
window.handleComment = handleComment;
window.handleReply = handleReply;
window.toggleReplyForm = toggleReplyForm;
window.handleCommentLike = handleCommentLike;
window.handleDeleteComment = handleDeleteComment;
window.handleReportComment = handleReportComment;
window.handleDeleteSubmission = handleDeleteSubmission;
window.handleCreateJam = handleCreateJam;
window.renderCreateJam = renderCreateJam;
window.logoutUser = logoutUser;
window.handleFileSelect = handleFileSelect;
window.renderEditProfile = renderEditProfile;
window.handleUpdateProfile = handleUpdateProfile;
window.handleAvatarUpload = handleAvatarUpload;