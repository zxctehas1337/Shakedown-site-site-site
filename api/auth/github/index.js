module.exports = (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : process.env.FRONTEND_URL || 'http://localhost:3000'}/api/auth/github/callback`;
  
  const authUrl = `https://github.com/login/oauth/authorize?` +
    `client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${encodeURIComponent('user:email')}`;
  
  res.redirect(authUrl);
};
