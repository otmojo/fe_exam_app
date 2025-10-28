import React, { useState } from 'react';

function Register({ onRegister, onSwitchToLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('登録が完了しました。ログインしてください！');
        if (onRegister) onRegister();
      } else {
        setError(data.error || '登録に失敗しました');
      }
    } catch {
      setError('ネットワークエラー');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>新規登録</h2>
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
      <div style={{ marginBottom: '15px' }}>
        <button 
          type="submit" 
          style={{ 
            width: '100%', 
            padding: '12px', 
            backgroundColor: '#4CAF50', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          登録
        </button>
      </div>
      <div style={{ textAlign: 'center' }}>
        <button 
          type="button" 
          onClick={onSwitchToLogin}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: 'transparent', 
            color: '#4CAF50', 
            border: '1px solid #4CAF50', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          ログインへ
        </button>
      </div>
      {error && <div style={{ color: 'red', textAlign: 'center', marginTop: '10px' }}>{error}</div>}
      {success && <div style={{ color: 'green', textAlign: 'center', marginTop: '10px' }}>{success}</div>}
    </form>
  );
}

export default Register;