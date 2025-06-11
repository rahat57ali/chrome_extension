// passport/google.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { pool, poolConnect, sql } = require('../db/mssql');
require('dotenv').config();

console.log(process.env.GOOGLE_CLIENT_ID);
console.log(process.env.GOOGLE_CLIENT_SECRET);
console.log(process.env.GOOGLE_REDIRECT_URI);

passport.use(
  new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_REDIRECT_URI
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        await poolConnect;
        const request = pool.request();
        const email = profile.emails[0].value;

        // Check if user exists
        const result = await request
          .input('email', sql.NVarChar, email)
          .query('SELECT * FROM temp_test_users WHERE email = @email');

        let user;
        if (result.recordset.length === 0) {
          // Insert new Google user
          const insertRequest = pool.request();

          await insertRequest
            .input('email', sql.NVarChar, email)
            .input('provider', sql.NVarChar, 'google')
            .query(`INSERT INTO temp_test_users (email, provider) VALUES (@email, @provider)`);

          user = { email, role: 'user' };
        } else {
          user = result.recordset[0];
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.email);
});

passport.deserializeUser(async (email, done) => {
  try {
    await poolConnect;
    const request = pool.request();
    const result = await request
      .input('email', sql.NVarChar, email)
      .query('SELECT * FROM temp_test_users WHERE email = @email');

    done(null, result.recordset[0]);
  } catch (err) {
    done(err, null);
  }
});
