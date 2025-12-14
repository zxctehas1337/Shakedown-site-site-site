# OAuth Launcher Authentication Fix

## Проблема

После входа через OAuth (Google, GitHub, Yandex) в лаунчере, пользователя перебрасывало в браузер на страницу Dashboard, а сама регистрация в лаунчере не проходила - просто ожидала, хотя авторизация была успешной.

## Причина

Проблема была в том, что OAuth flow не различал запросы от лаунчера и от веб-сайта:

1. **Лаунчер** отправлял запрос с параметром `redirect=launcher`:
   ```typescript
   const authUrl = `${API_URL}/api/auth/${provider}?redirect=launcher`
   ```

2. **Но backend** (`api/oauth.js`) **игнорировал** этот параметр и всегда перенаправлял на фронтенд:
   ```javascript
   res.redirect(`${frontendUrl}/auth?auth=success&user=${encodedUser}`);
   ```

3. В результате:
   - ✅ Авторизация проходила успешно
   - ❌ Данные отправлялись в браузер вместо лаунчера
   - ❌ Лаунчер продолжал ждать ответ на `http://127.0.0.1:3000/callback`

## Решение

### 1. Обновлен `api/oauth.js`

**Изменения:**
- Добавлен параметр `redirect` в query параметры
- Параметр `redirect` передается через весь OAuth flow
- При `redirect=launcher` происходит редирект на локальный сервер лаунчера

**Код:**
```javascript
// Главный handler
const { provider, action, redirect } = req.query;

// При инициализации OAuth - сохраняем redirect параметр
if (redirect === 'launcher') {
  redirectUri += `&redirect=launcher`;
}

// При callback - проверяем откуда запрос
if (redirect === 'launcher') {
  return res.redirect(`http://127.0.0.1:3000/callback?user=${encodedUser}`);
}
```

### 2. Улучшен `launcher/src-tauri/src/auth.rs`

**Изменения:**
- Добавлена обработка параметра `error` в callback
- Улучшено логирование ошибок

**Код:**
```rust
let mut error = None;

// Парсим error параметр
"error" => error = Some(value.to_string()),

// Обрабатываем ошибки
if error.is_some() {
    println!("❌ OAuth error: {:?}", error);
    let _ = app.emit("oauth-callback", OAuthCallbackPayload {
        token: None,
        user_data: None,
    });
}
```

## Как это работает теперь

### Веб-сайт (без изменений):
1. Пользователь нажимает "Войти через Google"
2. Запрос: `/api/auth/google` (без redirect параметра)
3. После авторизации: редирект на `https://shakedown.vercel.app/auth?auth=success&user=...`
4. ✅ Пользователь видит Dashboard

### Лаунчер (исправлено):
1. Пользователь нажимает "Войти через Google"
2. Запускается локальный сервер на `http://127.0.0.1:3000`
3. Запрос: `/api/auth/google?redirect=launcher`
4. После авторизации: редирект на `http://127.0.0.1:3000/callback?user=...`
5. ✅ Лаунчер получает данные и авторизует пользователя

## Тестирование

Для проверки исправления:

1. Запустите лаунчер
2. Нажмите на любую кнопку OAuth (Google/GitHub/Yandex)
3. Авторизуйтесь в браузере
4. Проверьте что:
   - ✅ Браузер показывает "Авторизация успешна!"
   - ✅ Лаунчер получает данные пользователя
   - ✅ Лаунчер переходит на главную страницу
   - ✅ Браузер можно закрыть

## Файлы изменены

- ✅ `c:\Site\api\oauth.js` - добавлена поддержка `redirect=launcher`
- ✅ `c:\Site\launcher\src-tauri\src\auth.rs` - улучшена обработка ошибок
