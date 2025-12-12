const { findOrCreateOAuthUser } = require('../../_lib/oauth');
const { generateToken } = require('../../_lib/jwt');
const { mapOAuthUser } = require('../../_lib/userMapper');

module.exports = async (req, res) => {
  const { code, error } = req.query;
  const frontendUrl = process.env.FRONTEND_URL || 'https://shakedown.vercel.app';
  
  if (error || !code) {
    return res.redirect(`${frontendUrl}/auth?error=google_failed`);
  }

  try {
    const redirectUri = `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : frontendUrl}/api/auth/google/callback`;
    
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    });

    const tokens = await tokenResponse.json();
    
    if (!tokens.access_token) {
      return res.redirect(`${frontendUrl}/auth?error=google_token_failed`);
    }

    // Get user info
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    });

    const profile = await userResponse.json();
    
    const user = await findOrCreateOAuthUser({
      id: profile.id,
      email: profile.email,
      name: profile.name
    }, 'google');

    const token = generateToken(user);
    const userData = mapOAuthUser(user, token);
    const encodedUser = encodeURIComponent(JSON.stringify(userData));
    
    res.redirect(`${frontendUrl}/auth?auth=success&user=${encodedUser}`);
  } catch (err) {
    console.error('Google OAuth error:', err);
    res.redirect(`${frontendUrl}/auth?error=google_failed`);
  }
};
