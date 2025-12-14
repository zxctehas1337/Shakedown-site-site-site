const nodemailer = require('nodemailer');
require('dotenv').config();

// Настройка SMTP транспорта
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 465,
  secure: (Number(process.env.SMTP_PORT) || 465) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Функция генерации 6-значного кода
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Функция отправки кода подтверждения
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
              <h1>Добро пожаловать, ${username}!</h1>
            </div>
            <div class="content">
              <p>Спасибо за регистрацию!</p>
              <p>Для завершения регистрации введите этот код подтверждения:</p>
              <div class="code-box">
                <div class="code">${verificationCode}</div>
              </div>
              <p class="warning">Код действителен в течение 10 минут</p>
              <p>Если вы не регистрировались на нашем сайте, просто проигнорируйте это письмо.</p>
            </div>
            <div class="footer">
              <p>© 2025 Shakedown. Все права защищены.</p>
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

module.exports = { transporter, generateVerificationCode, sendVerificationEmail };
