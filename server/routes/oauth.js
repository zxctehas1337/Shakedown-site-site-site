const express = require('express');
const router = express.Router();
const { passport } = require('../config/passport.js');
const { generateToken } = require('../utils/jwt.js');
const { mapOAuthUser } = require('../utils/userMapper.js');
require('dotenv').config();

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://shakedown.vercel.app';

// Google OAuth
router.get('/google', passport.authenticate('google', { 
  scope: ['profile', 'email'] 
}));

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: `${FRONTEND_URL}/auth?error=google_failed` }),
  (req, res) => {
    const user = req.user;
    const token = generateToken(user);
    const userData = mapOAuthUser(user, token);
    const encodedUser = encodeURIComponent(JSON.stringify(userData));
    res.redirect(`${FRONTEND_URL}/auth?auth=success&user=${encodedUser}`);
  }
);

// Yandex OAuth
router.get('/yandex', passport.authenticate('yandex'));

router.get('/yandex/callback',
  passport.authenticate('yandex', { failureRedirect: `${FRONTEND_URL}/auth?error=yandex_failed` }),
  (req, res) => {
    const user = req.user;
    const token = generateToken(user);
    const userData = mapOAuthUser(user, token);
    const encodedUser = encodeURIComponent(JSON.stringify(userData));
    res.redirect(`${FRONTEND_URL}/auth?auth=success&user=${encodedUser}`);
  }
);

// GitHub OAuth
router.get('/github', passport.authenticate('github', { 
  scope: ['user:email'] 
}));

router.get('/github/callback',
  passport.authenticate('github', { failureRedirect: `${FRONTEND_URL}/auth?error=github_failed` }),
  (req, res) => {
    const user = req.user;
    const token = generateToken(user);
    const userData = mapOAuthUser(user, token);
    const encodedUser = encodeURIComponent(JSON.stringify(userData));
    res.redirect(`${FRONTEND_URL}/auth?auth=success&user=${encodedUser}`);
  }
);

module.exports = router;
