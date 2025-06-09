
const bcrypt = require('bcrypt');
const { poolConnect, sql, pool } = require('../db/mssql');
const jwt = require('../utils/jwt');

exports.signup = async (req, res) => {
  const { email, password, role } = req.body;
  try {
    await poolConnect;
    const request = pool.request();

    // Check if user exists
    const result = await request
      .input('email', sql.NVarChar, email)
      .query('SELECT * FROM users WHERE email = @email');

    if (result.recordset.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    await request
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
