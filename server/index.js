const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const YandexStrategy = require('passport-yandex').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const session = require('express-session');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// Подключение к PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Middleware
app.use(cors({
  origin: process.env.VITE_API_URL || 'https://oneshakedown.onrender.com',
  credentials: true
}));
app.use(express.json());

// Session для OAuth
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 часа
  }
}));

// Инициализация Passport
app.use(passport.initialize());
app.use(passport.session());

// Сериализация пользователя
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    done(null, result.rows[0]);
  } catch (error) {
    done(error, null);
  }
});

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, '../dist')));

// Настройка SMTP транспорта
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 465,
  secure: true, // true для порта 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Функция генерации 6-значного кода
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Функция отправки кода подтверждения через Google SMTP
async function sendVerificationEmail(email, username, verificationCode) {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Код подтверждения регистрации - Inside',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; background-color: #0a0a0a; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 12px; overflow: hidden; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; }
            .header h1 { color: #ffffff; margin: 0; font-size: 28px; }
            .content { padding: 40px 30px; color: #ffffff; text-align: center; }
            .content p { font-size: 16px; line-height: 1.6; color: #cccccc; }
            .code-box { background: rgba(255, 255, 255, 0.1); border: 2px solid #667eea; border-radius: 12px; padding: 30px; margin: 30px 0; }
            .code { font-size: 48px; font-weight: bold; letter-spacing: 8px; color: #00d4ff; font-family: 'Courier New', monospace; }
            .footer { padding: 20px; text-align: center; color: #888888; font-size: 12px; border-top: 1px solid #2a2a3e; }
            .warning { color: #ff9800; font-size: 14px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✨ Добро пожаловать, ${username}! ✨</h1>
            </div>
            <div class="content">
              <p>Спасибо за регистрацию на платформе Inside!</p>
              <p>Для завершения регистрации введите этот код подтверждения:</p>
              <div class="code-box">
                <div class="code">${verificationCode}</div>
              </div>
              <p class="warning">Код действителен в течение 10 минут</p>
              <p>Если вы не регистрировались на нашем сайте, просто проигнорируйте это письмо.</p>
            </div>
            <div class="footer">
              <p>© 2024 Inside. Все права защищены.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Код подтверждения отправлен на ${email}`);
    console.log(`Код: ${verificationCode}`);
    
    return true;
  } catch (error) {
    console.error('❌ Ошибка отправки email:', error.message);
    return false;
  }
}

// Инициализация таблицы users
async function initDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        subscription VARCHAR(50) DEFAULT 'free',
        registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_admin BOOLEAN DEFAULT false,
        is_banned BOOLEAN DEFAULT false,
        email_verified BOOLEAN DEFAULT false,
        verification_code VARCHAR(6),
        verification_code_expires TIMESTAMP,
        settings JSONB DEFAULT '{"notifications": true, "autoUpdate": true, "theme": "dark", "language": "ru"}'::jsonb
      )
    `);
    
    // Добавляем колонки для существующих таблиц
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS verification_code VARCHAR(6),
      ADD COLUMN IF NOT EXISTS verification_code_expires TIMESTAMP,
      ADD COLUMN IF NOT EXISTS hwid VARCHAR(255),
      ADD COLUMN IF NOT EXISTS oauth_provider VARCHAR(50),
      ADD COLUMN IF NOT EXISTS oauth_id VARCHAR(255)
    `);
    
    console.log('✅ База данных инициализирована');
  } catch (error) {
    console.error('❌ Ошибка инициализации БД:', error);
  }
}

initDatabase();

// ==================== OAUTH STRATEGIES ====================

// Функция генерации JWT токена
function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, isAdmin: user.is_admin },
    process.env.JWT_SECRET || 'your-jwt-secret',
    { expiresIn: '7d' }
  );
}

// Функция поиска или создания OAuth пользователя
async function findOrCreateOAuthUser(profile, provider) {
  const email = profile.emails && profile.emails[0] ? profile.emails[0].value : `${profile.id}@${provider}.oauth`;
  const username = profile.displayName || profile.username || `${provider}_${profile.id}`;
  
  try {
    // Проверяем существует ли пользователь с таким email
    let result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rows.length > 0) {
      // Пользователь существует - обновляем oauth_provider если нужно
      const user = result.rows[0];
      await pool.query(
        'UPDATE users SET oauth_provider = $1, oauth_id = $2, email_verified = true WHERE id = $3',
        [provider, profile.id, user.id]
      );
      return user;
    }
    
    // Создаем нового пользователя
    // Проверяем уникальность username
    let uniqueUsername = username;
    let counter = 1;
    while (true) {
      const usernameCheck = await pool.query('SELECT id FROM users WHERE username = $1', [uniqueUsername]);
      if (usernameCheck.rows.length === 0) break;
      uniqueUsername = `${username}_${counter}`;
      counter++;
    }
    
    result = await pool.query(
      `INSERT INTO users (username, email, password, oauth_provider, oauth_id, email_verified, subscription) 
       VALUES ($1, $2, $3, $4, $5, true, 'free') 
       RETURNING *`,
      [uniqueUsername, email, crypto.randomBytes(32).toString('hex'), provider, profile.id]
    );
    
    return result.rows[0];
  } catch (error) {
    console.error(`OAuth ${provider} error:`, error);
    throw error;
  }
}

// Google Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback'
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const user = await findOrCreateOAuthUser(profile, 'google');
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }));
  console.log('✅ Google OAuth настроен');
}

// Yandex Strategy
if (process.env.YANDEX_CLIENT_ID && process.env.YANDEX_CLIENT_SECRET) {
  passport.use(new YandexStrategy({
    clientID: process.env.YANDEX_CLIENT_ID,
    clientSecret: process.env.YANDEX_CLIENT_SECRET,
    callbackURL: process.env.YANDEX_CALLBACK_URL || '/api/auth/yandex/callback'
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const user = await findOrCreateOAuthUser(profile, 'yandex');
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }));
  console.log('✅ Yandex OAuth настроен');
}

// GitHub Strategy
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL || '/api/auth/github/callback',
    scope: ['user:email']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const user = await findOrCreateOAuthUser(profile, 'github');
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }));
  console.log('✅ GitHub OAuth настроен');
}

// ==================== OAUTH ROUTES ====================

// Google OAuth
app.get('/api/auth/google', passport.authenticate('google', { 
  scope: ['profile', 'email'] 
}));

app.get('/api/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/auth?error=google_failed' }),
  (req, res) => {
    const user = req.user;
    const token = generateToken(user);
    const userData = {
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
    const encodedUser = encodeURIComponent(JSON.stringify(userData));
    res.redirect(`/auth?auth=success&user=${encodedUser}`);
  }
);

// Yandex OAuth
app.get('/api/auth/yandex', passport.authenticate('yandex'));

app.get('/api/auth/yandex/callback',
  passport.authenticate('yandex', { failureRedirect: '/auth?error=yandex_failed' }),
  (req, res) => {
    const user = req.user;
    const token = generateToken(user);
    const userData = {
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
    const encodedUser = encodeURIComponent(JSON.stringify(userData));
    res.redirect(`/auth?auth=success&user=${encodedUser}`);
  }
);

// GitHub OAuth
app.get('/api/auth/github', passport.authenticate('github', { 
  scope: ['user:email'] 
}));

app.get('/api/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/auth?error=github_failed' }),
  (req, res) => {
    const user = req.user;
    const token = generateToken(user);
    const userData = {
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
    const encodedUser = encodeURIComponent(JSON.stringify(userData));
    res.redirect(`/auth?auth=success&user=${encodedUser}`);
  }
);

// ==================== END OAUTH ====================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ==================== PRODUCTS/PRICES ENDPOINT ====================

// Товары и цены
const PRODUCTS = [
  {
    id: 'client-30',
    name: 'Клиент на 30 дней',
    price: 199,
    duration: 30,
    description: 'Доступ к клиенту на 30 дней',
    features: ['Полный функционал', 'Обновления', 'Поддержка']
  },
  {
    id: 'client-90',
    name: 'Клиент на 90 дней',
    price: 449,
    duration: 90,
    description: 'Доступ к клиенту на 90 дней',
    features: ['Полный функционал', 'Обновления', 'Поддержка'],
    popular: true
  },
  {
    id: 'client-lifetime',
    name: 'Клиент навсегда',
    price: 999,
    duration: -1,
    description: 'Пожизненный доступ к клиенту',
    features: ['Полный функционал', 'Все обновления', 'Приоритетная поддержка']
  },
  {
    id: 'hwid-reset',
    name: 'Сброс привязки',
    price: 99,
    description: 'Сброс HWID привязки',
    features: ['Мгновенный сброс', 'Новая привязка']
  }
];

// Получить все продукты
app.get('/api/products', (req, res) => {
  res.json({ success: true, data: PRODUCTS });
});

// Получить конкретный продукт по ID
app.get('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const product = PRODUCTS.find(p => p.id === id);
  
  if (!product) {
    return res.json({ success: false, message: 'Продукт не найден' });
  }
  
  res.json({ success: true, data: product });
});

// ==================== END PRODUCTS ====================

// Регистрация
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Проверка существования пользователя
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      const existing = existingUser.rows[0];
      if (existing.username === username) {
        return res.json({ success: false, message: 'Пользователь с таким логином уже существует' });
      }
      if (existing.email === email) {
        return res.json({ success: false, message: 'Email уже зарегистрирован' });
      }
    }

    // Генерация 6-значного кода
    const verificationCode = generateVerificationCode();
    const codeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 минут

    // Создание пользователя
    const result = await pool.query(
      `INSERT INTO users (username, email, password, verification_code, verification_code_expires, email_verified) 
       VALUES ($1, $2, $3, $4, $5, false) 
       RETURNING id, username, email, subscription, registered_at, is_admin, is_banned, email_verified, settings`,
      [username, email, Buffer.from(password).toString('base64'), verificationCode, codeExpires]
    );

    const user = {
      id: result.rows[0].id,
      username: result.rows[0].username,
      email: result.rows[0].email,
      password: result.rows[0].password,
      subscription: result.rows[0].subscription,
      registeredAt: result.rows[0].registered_at,
      isAdmin: result.rows[0].is_admin,
      isBanned: result.rows[0].is_banned,
      emailVerified: result.rows[0].email_verified,
      settings: result.rows[0].settings
    };

    // Отправка кода подтверждения
    const emailSent = await sendVerificationEmail(email, username, verificationCode);
    
    if (emailSent) {
      res.json({ 
        success: true, 
        message: 'Код подтверждения отправлен на email', 
        requiresVerification: true,
        data: user 
      });
    } else {
      res.json({ 
        success: false, 
        message: 'Ошибка отправки кода. Попробуйте позже.'
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
});

// Подтверждение email по коду
app.post('/api/auth/verify-code', async (req, res) => {
  const { userId, code } = req.body;

  if (!userId || !code) {
    return res.json({ succe: 'Не указан ID пользователя или код' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.json({ success: false, message: 'Пользователь не найден' });
    }

    const user = result.rows[0];

    // Проверка срока действия кода
    if (new Date() > new Date(user.verification_code_expires)) {
      return res.json({ success: false, message: 'Код истек. Запросите новый код.' });
    }

    // Проверка кода
    if (user.verification_code !== code) {
      return res.json({ success: false, message: 'Неверный код подтверждения' });
    }

    // Обновляем статус подтверждения
    await pool.query(
      'UPDATE users SET email_verified = true, verification_code = NULL, verification_code_expires = NULL WHERE id = $1',
      [userId]
    );

    res.json({ success: true, message: 'Email успешно подтвержден!' });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
});

// Повторная отправка кода
app.post('/api/auth/resend-code', async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.json({ success: false, message: 'Не указан ID пользователя' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.json({ success: false, message: 'Пользователь не найден' });
    }

    const user = result.rows[0];

    if (user.email_verified) {
      return res.json({ success: false, message: 'Email уже подтвержден' });
    }

    // Генерация нового кода
    const verificationCode = generateVerificationCode();
    const codeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 минут

    // Обновление кода в БД
    await pool.query(
      'UPDATE users SET verification_code = $1, verification_code_expires = $2 WHERE id = $3',
      [verificationCode, codeExpires, userId]
    );

    // Отправка нового кода
    const emailSent = await sendVerificationEmail(user.email, user.username, verificationCode);
    
    if (emailSent) {
      res.json({ success: true, message: 'Новый код отправлен на email' });
    } else {
      res.json({ success: false, message: 'Ошибка отправки кода' });
    }
  } catch (error) {
    console.error('Resend code error:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
});

// Вход
app.post('/api/auth/login', async (req, res) => {
  const { usernameOrEmail, password } = req.body;

  try {
    const encodedPassword = Buffer.from(password).toString('base64');
    
    const result = await pool.query(
      `SELECT id, username, email, password, subscription, registered_at, is_admin, is_banned, email_verified, settings 
       FROM users 
       WHERE (username = $1 OR email = $1) AND password = $2`,
      [usernameOrEmail, encodedPassword]
    );

    if (result.rows.length === 0) {
      return res.json({ success: false, message: 'Неверный логин или пароль' });
    }

    const dbUser = result.rows[0];

    if (dbUser.is_banned) {
      return res.json({ success: false, message: 'Ваш аккаунт заблокирован' });
    }

    const user = {
      id: dbUser.id,
      username: dbUser.username,
      email: dbUser.email,
      password: dbUser.password,
      subscription: dbUser.subscription,
      registeredAt: dbUser.registered_at,
      isAdmin: dbUser.is_admin,
      isBanned: dbUser.is_banned,
      emailVerified: dbUser.email_verified,
      settings: dbUser.settings
    };

    res.json({ success: true, message: 'Вход выполнен!', data: user });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
});

// Обновление пользователя
app.patch('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updates).forEach(key => {
      const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      if (dbKey === 'settings') {
        fields.push(`${dbKey} = $${paramCount}`);
        values.push(JSON.stringify(updates[key]));
      } else {
        fields.push(`${dbKey} = $${paramCount}`);
        values.push(updates[key]);
      }
      paramCount++;
    });

    values.push(id);

    const result = await pool.query(
      `UPDATE users SET ${fields.join(', ')} 
       WHERE id = $${paramCount} 
       RETURNING id, username, email, password, subscription, registered_at, is_admin, is_banned, settings`,
      values
    );

    if (result.rows.length === 0) {
      return res.json({ success: false, message: 'Пользователь не найден' });
    }

    const dbUser = result.rows[0];
    const user = {
      id: dbUser.id,
      username: dbUser.username,
      email: dbUser.email,
      password: dbUser.password,
      subscription: dbUser.subscription,
      registeredAt: dbUser.registered_at,
      isAdmin: dbUser.is_admin,
      isBanned: dbUser.is_banned,
      settings: dbUser.settings
    };

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
});

// Получение информации о пользователе
app.get('/api/users/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT id, username, email, password, subscription, registered_at, is_admin, is_banned, email_verified, settings 
       FROM users WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.json({ success: false, message: 'Пользователь не найден' });
    }

    const dbUser = result.rows[0];
    const user = {
      id: dbUser.id,
      username: dbUser.username,
      email: dbUser.email,
      password: dbUser.password,
      subscription: dbUser.subscription,
      registeredAt: dbUser.registered_at,
      isAdmin: dbUser.is_admin,
      isBanned: dbUser.is_banned,
      emailVerified: dbUser.email_verified,
      settings: dbUser.settings
    };

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
});

// Получение всех пользователей (для админки)
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, username, email, subscription, registered_at, is_admin, is_banned, email_verified, settings 
       FROM users ORDER BY id DESC`
    );

    const users = result.rows.map(dbUser => ({
      id: dbUser.id,
      username: dbUser.username,
      email: dbUser.email,
      subscription: dbUser.subscription,
      registeredAt: dbUser.registered_at,
      isAdmin: dbUser.is_admin,
      isBanned: dbUser.is_banned,
      emailVerified: dbUser.email_verified,
      settings: dbUser.settings
    }));

    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
});

// ==================== HWID ENDPOINTS ====================

// Получить HWID пользователя
app.get('/api/hwid/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      'SELECT hwid FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.json({ success: false, message: 'Пользователь не найден' });
    }

    res.json({ 
      success: true, 
      hwid: result.rows[0].hwid || null 
    });
  } catch (error) {
    console.error('Get HWID error:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
});

// Установить/обновить HWID пользователя (для лаунчера)
app.post('/api/hwid/set', async (req, res) => {
  const { userId, hwid } = req.body;

  if (!userId || !hwid) {
    return res.json({ success: false, message: 'Не указан userId или hwid' });
  }

  try {
    // Проверяем, не привязан ли этот HWID к другому аккаунту
    const existingHwid = await pool.query(
      'SELECT id, username FROM users WHERE hwid = $1 AND id != $2',
      [hwid, userId]
    );

    if (existingHwid.rows.length > 0) {
      return res.json({ 
        success: false, 
        message: 'Этот HWID уже привязан к другому аккаунту' 
      });
    }

    // Проверяем, есть ли у пользователя уже HWID
    const userResult = await pool.query(
      'SELECT hwid FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.json({ success: false, message: 'Пользователь не найден' });
    }

    const currentHwid = userResult.rows[0].hwid;

    // Если HWID уже установлен и отличается - запрещаем
    if (currentHwid && currentHwid !== hwid) {
      return res.json({ 
        success: false, 
        message: 'HWID уже привязан. Для смены требуется сброс.' 
      });
    }

    // Устанавливаем HWID
    await pool.query(
      'UPDATE users SET hwid = $1 WHERE id = $2',
      [hwid, userId]
    );

    res.json({ 
      success: true, 
      message: 'HWID успешно привязан' 
    });
  } catch (error) {
    console.error('Set HWID error:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
});

// Сбросить HWID пользователя (для админки или после оплаты)
app.post('/api/hwid/reset', async (req, res) => {
  const { userId, adminKey } = req.body;

  if (!userId) {
    return res.json({ success: false, message: 'Не указан userId' });
  }

  try {
    // Проверка прав (админ или сам пользователь после оплаты)
    // Здесь можно добавить проверку adminKey или токена

    await pool.query(
      'UPDATE users SET hwid = NULL WHERE id = $1',
      [userId]
    );

    res.json({ 
      success: true, 
      message: 'HWID успешно сброшен' 
    });
  } catch (error) {
    console.error('Reset HWID error:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
});

// Проверить HWID (для лаунчера при запуске)
app.post('/api/hwid/verify', async (req, res) => {
  const { userId, hwid } = req.body;

  if (!userId || !hwid) {
    return res.json({ success: false, message: 'Не указан userId или hwid' });
  }

  try {
    const result = await pool.query(
      'SELECT hwid, subscription, is_banned FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.json({ success: false, message: 'Пользователь не найден' });
    }

    const user = result.rows[0];

    if (user.is_banned) {
      return res.json({ success: false, message: 'Аккаунт заблокирован' });
    }

    // Если HWID не установлен - устанавливаем
    if (!user.hwid) {
      await pool.query(
        'UPDATE users SET hwid = $1 WHERE id = $2',
        [hwid, userId]
      );
      return res.json({ 
        success: true, 
        message: 'HWID привязан',
        subscription: user.subscription 
      });
    }

    // Проверяем совпадение HWID
    if (user.hwid !== hwid) {
      return res.json({ 
        success: false, 
        message: 'HWID не совпадает. Требуется сброс привязки.' 
      });
    }

    res.json({ 
      success: true, 
      message: 'HWID подтвержден',
      subscription: user.subscription 
    });
  } catch (error) {
    console.error('Verify HWID error:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
});

// ==================== END HWID ENDPOINTS ====================

// Serve index.html for all other routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                  🚀 INSIDE Server v3.0.0                  ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  console.log(`✅ Сервер запущен на порту ${PORT}`);
  console.log(`📧 Google SMTP: ${process.env.SMTP_USER || 'Не настроен'}`);
  console.log(`🗄️  База данных: Подключена\n`);
  console.log('📝 Доступные эндпоинты:');
  console.log('   POST /api/auth/register - Регистрация с отправкой кода');
  console.log('   POST /api/auth/login - Вход');
  console.log('   POST /api/auth/verify-code - Подтверждение кода');
  console.log('   POST /api/auth/resend-code - Повторная отправка кода');
  console.log('   GET  /api/users - Список пользователей');
  console.log('   GET  /api/users/:id - Информация о пользователе');
  console.log('   GET  /api/hwid/:userId - Получить HWID пользователя');
  console.log('   POST /api/hwid/set - Установить HWID');
  console.log('   POST /api/hwid/reset - Сбросить HWID');
  console.log('   POST /api/hwid/verify - Проверить HWID');
  console.log('   GET  /api/products - Список продуктов и цен');
  console.log('   GET  /api/products/:id - Информация о продукте\n');
  console.log('🔐 OAuth эндпоинты:');
  console.log('   GET  /api/auth/google - Вход через Google');
  console.log('   GET  /api/auth/yandex - Вход через Yandex');
  console.log('   GET  /api/auth/github - Вход через GitHub\n');
  console.log('🧪 Тестирование:');
  console.log('   npm run test:email - Проверка отправки email');
  console.log('   npm run test:registration - Тест регистрации\n');
  console.log('═══════════════════════════════════════════════════════════════\n');
});
