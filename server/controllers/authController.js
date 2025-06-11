// controllers/authController.js
const bcrypt = require('bcrypt');
const { poolConnect, sql, pool } = require('../db/mssql');
const { google } = require('googleapis');
const jwt = require('../utils/jwt');

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

exports.googleAuth = (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['profile', 'email'],
  });
  res.redirect(url);
};

exports.googleCallback = async (req, res) => {
  const { code } = req.query;
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
  const userInfo = await oauth2.userinfo.get();

  const email = userInfo.data.email;

  await poolConnect;
  const request = pool.request();
  let result = await request
    .input('email', sql.NVarChar, email)
    .query('SELECT * FROM users WHERE email = @email');

  // Create if not exists
  if (result.recordset.length === 0) {
    await request
      .input('email', sql.NVarChar, email)
      .input('provider', sql.NVarChar, 'google')
      .query(`INSERT INTO users (email, provider) VALUES (@email, @provider)`);

    result = await request
      .input('email', sql.NVarChar, email)
      .query('SELECT * FROM users WHERE email = @email');
  }

  const user = result.recordset[0];
  const token = jwt.generateToken({ id: user.id, email: user.email, role: user.role });

  // Send token to extension via redirect
  res.redirect(`chrome-extension://${EXTENSION_ID}/oauth.html?token=${token}`);
};


exports.signup = async (req, res) => {
  const { email, password, role } = req.body;
  try {
    await poolConnect;
    const request = pool.request();

    // Check if user exists
    const checkRequest = pool.request();
    const result = await checkRequest
      .input('email', sql.NVarChar, email)
      .query('SELECT * FROM users WHERE email = @email');

    if (result.recordset.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    //Insert new user
    const insertRequest = pool.request();
    await insertRequest
      .input('email', sql.NVarChar, email)
      .input('password_hash', sql.NVarChar, password_hash)
      .input('role', sql.NVarChar, role || 'user')
      .query(`
        INSERT INTO users (email, password_hash, role)
        VALUES (@email, @password_hash, @role)
      `);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    await poolConnect;
    const request = pool.request();
    const result = await request
      .input('email', sql.NVarChar, email)
      .query('SELECT * FROM users WHERE email = @email');

    if (result.recordset.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = result.recordset[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.generateToken({ id: user.id, role: user.role, email: user.email });

    res.json({ token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getProfile = async (req, res) => {
  const user = req.user; // populated by authMiddleware
  res.json({ user });
};
