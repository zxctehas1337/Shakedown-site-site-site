const { findOrCreateOAuthUser } = require('../../_lib/oauth');
const { generateToken } = require('../../_lib/jwt');
const { mapOAuthUser } = require('../../_lib/userMapper');

module.exports = async (req, res) => {
  const { code, error } = req.query;
  const frontendUrl = process.env.FRONTEND_URL || 'https://shakedown.vercel.app';
  
  if (error || !code) {
    return res.redirect(`${frontendUrl}/auth?error=yandex_failed`);
  }

  try {
    // Exchange code for token
    const tokenResponse = await fetch('https://oauth.yandex.ru/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: process.env.YANDEX_CLIENT_ID,
        client_secret: process.env.YANDEX_CLIENT_SECRET
      })
    });

    const tokens = await tokenResponse.json();
    
    if (!tokens.access_token) {
      return res.redirect(`${frontendUrl}/auth?error=yandex_token_failed`);
    }

    // Get user info
    const userResponse = await fetch('https://login.yandex.ru/info?format=json', {
      headers: { Authorization: `OAuth ${tokens.access_token}` }
    });

    const profile = await userResponse.json();
    
    const user = await findOrCreateOAuthUser({
      id: profile.id,
      email: profile.default_email || `${profile.id}@yandex.oauth`,
      name: profile.display_name || profile.login
    }, 'yandex');

    const token = generateToken(user);
    const userData = mapOAuthUser(user, token);
    const encodedUser = encodeURIComponent(JSON.stringify(userData));
    
    res.redirect(`${frontendUrl}/auth?auth=success&user=${encodedUser}`);
  } catch (err) {
    console.error('Yandex OAuth error:', err);
    res.redirect(`${frontendUrl}/auth?error=yandex_failed`);
  }
};
