const { findOrCreateOAuthUser } = require('../../_lib/oauth');
const { generateToken } = require('../../_lib/jwt');
const { mapOAuthUser } = require('../../_lib/userMapper');

module.exports = async (req, res) => {
  const { code, error } = req.query;
  const frontendUrl = process.env.FRONTEND_URL || 'https://shakedown.vercel.app';
  
  if (error || !code) {
    return res.redirect(`${frontendUrl}/auth?error=github_failed`);
  }

  try {
    // Exchange code for token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code
      })
    });

    const tokens = await tokenResponse.json();
    
    if (!tokens.access_token) {
      return res.redirect(`${frontendUrl}/auth?error=github_token_failed`);
    }

    // Get user info
    const userResponse = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    });

    const profile = await userResponse.json();
    
    // Get email if not public
    let email = profile.email;
    if (!email) {
      const emailsResponse = await fetch('https://api.github.com/user/emails', {
        headers: { Authorization: `Bearer ${tokens.access_token}` }
      });
      const emails = await emailsResponse.json();
      const primaryEmail = emails.find(e => e.primary);
      email = primaryEmail ? primaryEmail.email : null;
    }

    const user = await findOrCreateOAuthUser({
      id: profile.id.toString(),
      email: email,
      name: profile.name || profile.login,
      login: profile.login
    }, 'github');

    const token = generateToken(user);
    const userData = mapOAuthUser(user, token);
    const encodedUser = encodeURIComponent(JSON.stringify(userData));
    
    res.redirect(`${frontendUrl}/auth?auth=success&user=${encodedUser}`);
  } catch (err) {
    console.error('GitHub OAuth error:', err);
    res.redirect(`${frontendUrl}/auth?error=github_failed`);
  }
};
