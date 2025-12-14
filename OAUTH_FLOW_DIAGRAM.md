# OAuth Flow Comparison

## ❌ BEFORE (Broken)

```
┌─────────────┐
│  Launcher   │
└──────┬──────┘
       │ 1. Click "Login with Google"
       │ 2. Start local server on :3000
       │ 3. Open browser: /api/auth/google?redirect=launcher
       ↓
┌─────────────────────────────────────────────────────────┐
│  Backend (api/oauth.js)                                 │
│  ❌ PROBLEM: Ignores 'redirect' parameter               │
│  ❌ Always redirects to frontend                        │
└──────┬──────────────────────────────────────────────────┘
       │ 4. Redirect to: https://shakedown.vercel.app/auth?user=...
       ↓
┌─────────────┐
│   Browser   │  ← User sees Dashboard
│  Dashboard  │  ← But launcher still waiting!
└─────────────┘

┌─────────────┐
│  Launcher   │  ← Still waiting for http://127.0.0.1:3000/callback
│   Waiting   │  ← Never receives data! ❌
└─────────────┘
```

## ✅ AFTER (Fixed)

```
┌─────────────┐
│  Launcher   │
└──────┬──────┘
       │ 1. Click "Login with Google"
       │ 2. Start local server on :3000
       │ 3. Open browser: /api/auth/google?redirect=launcher
       ↓
┌─────────────────────────────────────────────────────────┐
│  Backend (api/oauth.js)                                 │
│  ✅ Detects 'redirect=launcher'                         │
│  ✅ Redirects to launcher's local server                │
└──────┬──────────────────────────────────────────────────┘
       │ 4. Redirect to: http://127.0.0.1:3000/callback?user=...
       ↓
┌─────────────┐
│  Launcher   │  ← Receives user data! ✅
│   :3000     │  ← Emits 'oauth-callback' event
└──────┬──────┘
       │ 5. Frontend receives event
       │ 6. Parses user data
       │ 7. Calls onLogin(user)
       ↓
┌─────────────┐
│  Launcher   │
│  Dashboard  │  ← User logged in! ✅
└─────────────┘

┌─────────────┐
│   Browser   │  ← Shows "Авторизация успешна!"
│  Success    │  ← Can be closed
└─────────────┘
```

## Key Changes

### 1. Backend (`api/oauth.js`)

```javascript
// Extract redirect parameter
const { provider, action, redirect } = req.query;

// Preserve redirect through OAuth flow
if (redirect === 'launcher') {
  redirectUri += `&redirect=launcher`;
}

// Redirect to launcher instead of frontend
if (redirect === 'launcher') {
  return res.redirect(`http://127.0.0.1:3000/callback?user=${encodedUser}`);
}
```

### 2. Launcher Backend (`auth.rs`)

```rust
// Parse error parameter
"error" => error = Some(value.to_string()),

// Handle errors properly
if error.is_some() {
    println!("❌ OAuth error: {:?}", error);
    let _ = app.emit("oauth-callback", OAuthCallbackPayload {
        token: None,
        user_data: None,
    });
}
```

## Testing Checklist

- [ ] Launcher OAuth with Google works
- [ ] Launcher OAuth with GitHub works
- [ ] Launcher OAuth with Yandex works
- [ ] Website OAuth still works (not broken)
- [ ] Error handling works in launcher
- [ ] Browser shows success message
- [ ] Launcher receives user data
- [ ] User is logged in to launcher
