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

// DASHBOARD FUNCTIONS
async function loadDashboard() {
    try {
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        const response = await fetch('http://localhost:3000/api/profiles', { headers });
        const users = await response.json();
        
        document.getElementById('stat-total').textContent = users.length;
        const males = users.filter(u => u.gender.toLowerCase() === 'male').length;
        document.getElementById('stat-male').textContent = males;
        document.getElementById('stat-female').textContent = users.length - males;

        const grid = document.getElementById('profiles-grid');
        grid.innerHTML = users.map(user => `
            <div class="profile-mini">
                <h3>${user.name}</h3>
                <p>Age: ${user.age} | ${user.gender}</p>
                <p>${user.religion} | ${user.location}</p>
                <p>${user.profession}</p>
            </div>
        `).join('');
        console.log('✅ Dashboard loaded:', users.length);
    } catch (error) {
        console.error('Dashboard error:', error);
        showMessage('Backend not running (start: cd backend && npm start)', 'error');
    }
}

function updateAgeRange() {
    document.getElementById('ageRange').textContent = 
        document.getElementById('ageMin').value + '-' + document.getElementById('ageMax').value;
}

async function loadFilteredProfiles() {
    try {
        const token = localStorage.getItem('token');
        if (!token) return showMessage('Please login first!', 'error');
        
        const filters = {
            ageMin: document.getElementById('ageMin').value,
            ageMax: document.getElementById('ageMax').value,
            religion: document.getElementById('religionFilter').value,
            location: document.getElementById('locationFilter').value,
            search: document.getElementById('searchInput').value
        };
        
        const params = new URLSearchParams(filters);
        const response = await fetch(`http://localhost:3000/api/profiles/filter?${params}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const profiles = await response.json();
        
        document.getElementById('stat-total').textContent = profiles.length;
        const males = profiles.filter(u => u.gender.toLowerCase() === 'male').length;
        document.getElementById('stat-male').textContent = males;
        document.getElementById('stat-female').textContent = profiles.length - males;

        const grid = document.getElementById('profiles-grid');
        grid.innerHTML = profiles.map(user => `
            <div class="profile-mini">
                <h3>${user.name}</h3>
                <p>Age: ${user.age} | ${user.gender}</p>
                <p>${user.religion} | ${user.location}</p>
                <p>${user.profession}</p>
            </div>
        `).join('');
        
        showMessage(`Found ${profiles.length} profiles`, 'success');
    } catch (error) {
        showMessage('Filter failed', 'error');
        loadDashboard();
    }
}

// FORM HANDLERS
async function handleRegister(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const userData = Object.fromEntries(formData);
    try {
        showMessage('Connecting to backend...', 'success');
        const response = await fetch('http://localhost:3000/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        const result = await response.json();
        if (response.ok) {
            showMessage('Registered! Redirecting...', 'success');
            setTimeout(() => window.location.href = 'login.html', 1500);
        } else {
            showMessage(result.error || 'Registration failed', 'error');
        }
    } catch (error) {
        showMessage('Backend not running! Terminal 1: cd backend && npm start', 'error');
    }
}

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
            localStorage.setItem('token', result.token);
            localStorage.setItem('user', JSON.stringify(result.user));
            showMessage('Login success! Redirecting...', 'success');
            setTimeout(() => window.location.href = 'dashboard.html', 1000);
        } else {
            showMessage(result.error || 'Login failed', 'error');
        }
    } catch (error) {
        showMessage('Backend not running! Terminal 1: cd backend && npm start', 'error');
    }
}

// SINGLE PAGE INIT (NO DUPLICATES!)
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Page loaded:', document.title);
    
    // Dashboard auto-load
    if (document.getElementById('profiles-grid')) {
        console.log('🎯 Dashboard detected');
        if (document.getElementById('ageMin')) {
            console.log('🔍 Filters ready');
            updateAgeRange();
            loadFilteredProfiles();
        } else {
            console.log('📊 Loading dashboard');
            loadDashboard();
        }
    }
    
    // Form handlers
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
        console.log('✅ Register form ready');
    }
    
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
        console.log('✅ Login form ready');
    }
});