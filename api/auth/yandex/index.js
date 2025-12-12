module.exports = (req, res) => {
  const clientId = process.env.YANDEX_CLIENT_ID;
  const redirectUri = `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : process.env.FRONTEND_URL || 'http://localhost:3000'}/api/auth/yandex/callback`;
  
  const authUrl = `https://oauth.yandex.ru/authorize?` +
    `client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code`;
  
  res.redirect(authUrl);
};
