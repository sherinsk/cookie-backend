const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();

// Middleware
// CORS Configuration
app.use(
    cors({
        origin: "https://cookie-frontend-delta.vercel.app", // Allow frontend access
        credentials: true, // Allow cookies to be sent
    })
);


app.use(express.json());
app.use(cookieParser());



// Dummy User (Replace with database logic)
const users = [{ id: 1, username: 'user1', password: 'password123' }];
JWT_SECRET="SHERINSK"
// Sign-in Route
app.post('/signin', (req, res) => {
    const { username, password } = req.body;

    // Find user
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate Token
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
        expiresIn: '1h'
    });

    // Set cookie
    res.cookie('token', token, {
        httpOnly: true,   // Prevents JavaScript access (XSS protection)
        secure: true, // Use secure cookies in production
        sameSite: 'Strict' // Prevents CSRF attacks
    });

    res.json({ message: 'Signed in successfully' });
});

// Middleware to Protect Routes
const verifyToken = (req, res, next) => {
    const token = req.cookies.token;
    console.log(token)
    if (!token) {
        return res.status(403).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

// Protected Route
app.get('/protected', verifyToken, (req, res) => {
    res.json({ message: `Hello ${req.user.username}, you have access!` });
});

// Logout Route
app.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
});

// Start Server
app.listen(5000, () => {
    console.log(`Server running on port 5000`);
});
