module.exports = (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : process.env.FRONTEND_URL || 'http://localhost:3000'}/api/auth/google/callback`;
  
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent('profile email')}` +
    `&access_type=offline`;
  
  res.redirect(authUrl);
};
