// Message system
const showMessage = (message, type = 'success') => {
    const msgBox = document.getElementById('msg');
    if (msgBox) {
        msgBox.textContent = message;
        msgBox.className = `msg-box msg-${type}`;
        msgBox.style.display = 'block';
        setTimeout(() => msgBox.style.display = 'none', 4000);
    }
};

// DASHBOARD FUNCTIONS (only run on dashboard page)
document.addEventListener('DOMContentLoaded', function() {
    // Only load dashboard if on dashboard page
    if (document.getElementById('profiles-grid')) {
        loadDashboard();
    }
    
    // Setup forms if they exist
    setupForms();
});

async function loadDashboard() {
    try {
        // GET JWT TOKEN FROM LOGIN
        const token = localStorage.getItem('token');
        
        // SEND TOKEN WITH REQUEST (Authorization header)
        const headers = token ? { 
            'Authorization': `Bearer ${token}` 
        } : {};
        
        // FETCH REAL USERS FROM BACKEND (with token)
        const response = await fetch('http://localhost:3000/api/profiles', {
            headers: headers
        });
        const users = await response.json();
        
        // UPDATE STATS WITH REAL DATA
        document.getElementById('stat-total').textContent = users.length;
        const males = users.filter(u => u.gender.toLowerCase() === 'male').length;
        document.getElementById('stat-male').textContent = males;
        document.getElementById('stat-female').textContent = users.length - males;

        // SHOW USERS IN GRID
        const grid = document.getElementById('profiles-grid');
        grid.innerHTML = users.map(user => `
            <div class="profile-mini">
                <h3>${user.name}</h3>
                <p>Age: ${user.age} | ${user.gender}</p>
                <p>${user.religion} | ${user.location}</p>
                <p>${user.profession}</p>
            </div>
        `).join('');
        
        console.log('✅ Dashboard loaded', users.length, 'users with JWT');
    } catch (error) {
        console.error('Dashboard error:', error);
        showMessage('Dashboard data unavailable', 'error');
    }
}



// FORM HANDLERS
function setupForms() {
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
}

// REGISTER API
async function handleRegister(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const userData = Object.fromEntries(formData);

    try {
        showMessage('📡 Connecting to backend...', 'success');
        const response = await fetch('http://localhost:3000/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        const result = await response.json();
        
        if (response.ok) {
            showMessage(result.message || 'Registration successful!', 'success');
            setTimeout(() => window.location.href = 'login.html', 2000);
        } else {
            showMessage(result.error || 'Registration failed', 'error');
        }
    } catch (error) {
        console.error('Register error:', error);
        showMessage('❌ Backend not running. Check Terminal 1 (port 3000)', 'error');
    }
}

// LOGIN API
// LOGIN API (JWT VERSION)
async function handleLogin(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const loginData = Object.fromEntries(formData);

    try {
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginData)
        });

        const result = await response.json();
        
        if (response.ok) {
            // STORE JWT TOKEN + USER DATA
            localStorage.setItem('token', result.token);
            localStorage.setItem('user', JSON.stringify(result.user));
            showMessage(result.message || 'Login successful!', 'success');
            setTimeout(() => window.location.href = 'dashboard.html', 1000);
        } else {
            showMessage(result.error || 'Login failed', 'error');
        }
    } catch (error) {
        showMessage('Backend not running', 'error');
    }
}
