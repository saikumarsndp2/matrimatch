const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
const PORT = 3000;
const JWT_SECRET = 'matrimatch-super-secret-key-2026'; // Change in production

// Middleware
app.use(cors());
app.use(express.json());

// In-memory users (replace with MySQL later)
let users = [];

// REGISTER with PASSWORD HASHING
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password, age, gender, religion, location, profession } = req.body;
        
        // Check if user exists
        if (users.find(user => user.email === email)) {
            return res.status(400).json({ error: 'Email already registered!' });
        }
        
        // HASH PASSWORD with bcrypt
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        // Create new user
        const newUser = { 
            id: Date.now(), 
            name, 
            email, 
            password: hashedPassword,  // SAVED AS HASH
            age, 
            gender, 
            religion, 
            location, 
            profession 
        };
        users.push(newUser);
        
        console.log('✅ New user registered:', newUser.name);
        res.json({ message: 'Registration successful! Please login.' });
    } catch (error) {
        res.status(500).json({ error: 'Registration failed' });
    }
});

// LOGIN with PASSWORD VERIFICATION
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = users.find(u => u.email === email);
        if (!user) {
            return res.status(400).json({ error: 'User not found. Please register first.' });
        }
        
        // COMPARE PASSWORD WITH HASH
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Invalid password!' });
        }
        
        // CREATE JWT TOKEN
        const token = jwt.sign(
            { userId: user.id, email: user.email }, 
            JWT_SECRET, 
            { expiresIn: '1h' }
        );
        
        console.log('✅ Login success:', user.name);
        res.json({ 
            message: 'Login successful! Welcome back.',
            token,
            user: { name: user.name, email: user.email }
        });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});

// GET ALL PROFILES (PUBLIC)
app.get('/api/profiles', (req, res) => {
    const publicProfiles = users.map(({ password, ...profile }) => profile);
    res.json(publicProfiles);
});

// GET SINGLE PROFILE (PROTECTED - Task 4)
app.get('/api/profile/:id', authenticateToken, (req, res) => {
    const user = users.find(u => u.id == req.params.id);
    if (!user) {
        return res.status(404).json({ error: 'Profile not found' });
    }
    const { password, ...publicProfile } = user;
    res.json(publicProfile);
});

// JWT MIDDLEWARE (Task 4)
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
}

app.listen(PORT, () => {
    console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
