import React, { useState } from 'react';

function Login({ onLogin, onSwitchToRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [autoLogin, setAutoLogin] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setUsername('');
        setPassword('');
        setError('');
        onLogin(data, autoLogin); // ログイン成功、コールバックでトークンを保存（自動ログイン設定も含む）
      } else {
        setError(data.error || 'ログインに失敗しました');
      }
    } catch {
      setError('ネットワークエラー');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>ログイン</h2>
      <div style={{ marginBottom: '15px' }}>
        <input
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="ユーザー名"
          required
          style={{ 
            width: '100%', 
            padding: '10px', 
            border: '1px solid #ddd', 
            borderRadius: '4px',
            fontSize: '16px'
          }}
        />
      </div>
      <div style={{ marginBottom: '15px' }}>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="パスワード"
          required
          style={{ 
            width: '100%', 
            padding: '10px', 
            border: '1px solid #ddd', 
            borderRadius: '4px',
            fontSize: '16px'
          }}
        />
      </div>
      <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
        <input
          type="checkbox"
          id="autoLogin"
          checked={autoLogin}
          onChange={e => setAutoLogin(e.target.checked)}
          style={{ marginRight: '8px' }}
        />
        <label htmlFor="autoLogin" style={{ fontSize: '14px', color: '#666' }}>
          次回から自動ログイン
        </label>
      </div>
      <div style={{ marginBottom: '15px' }}>
        <button 
          type="submit" 
          style={{ 
            width: '100%', 
            padding: '12px', 
            backgroundColor: '#2196F3', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          ログイン
        </button>
      </div>
      <div style={{ textAlign: 'center' }}>
        <button 
          type="button" 
          onClick={onSwitchToRegister}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: 'transparent', 
            color: '#2196F3', 
            border: '1px solid #2196F3', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          新規登録へ
        </button>
      </div>
      {error && <div style={{ color: 'red', textAlign: 'center', marginTop: '10px' }}>{error}</div>}
    </form>
  );
}

export default Login;