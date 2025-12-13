// Маппинг пользователя из БД в API формат
function mapUserFromDb(dbUser) {
  return {
    id: dbUser.id,
    username: dbUser.username,
    email: dbUser.email,
    subscription: dbUser.subscription,
    registeredAt: dbUser.registered_at,
    isAdmin: dbUser.is_admin,
    isBanned: dbUser.is_banned,
    emailVerified: dbUser.email_verified,
    settings: dbUser.settings
  };
}

// Маппинг для OAuth ответа
function mapOAuthUser(user, token) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    subscription: user.subscription,
    registeredAt: user.registered_at,
    isAdmin: user.is_admin,
    isBanned: user.is_banned,
    emailVerified: true,
    settings: user.settings,
    token: token
  };
}

module.exports = { mapUserFromDb, mapOAuthUser };
