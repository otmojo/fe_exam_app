import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import Quiz from './components/Quiz';
import ITTerms from './components/ITTerms';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [username, setUsername] = useState(localStorage.getItem('username'));
  const [showRegister, setShowRegister] = useState(false);
  const [currentView, setCurrentView] = useState('quiz'); // 'quiz' or 'it-terms'
  const [loading, setLoading] = useState(true); 

  const handleLogin = (loginData, autoLogin = false) => {
    setToken(loginData.token);
    setUsername(loginData.username);
    localStorage.setItem('token', loginData.token);
    localStorage.setItem('username', loginData.username);
    
    // 自動ログイン設定を保存
    if (autoLogin) {
      localStorage.setItem('autoLogin', 'true');
    } else {
      localStorage.removeItem('autoLogin');
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUsername(null);
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('autoLogin'); // ログアウト時に自動ログイン設定も削除
  };

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <img src="/l-icon.png" alt="Loading-icon..." style={{ width: '600px' }} />
      </div>
    );
  }

  if (!token) {
    return showRegister
      ? <Register onRegister={() => setShowRegister(false)} onSwitchToLogin={() => setShowRegister(false)} />
      : <Login onLogin={handleLogin} onSwitchToRegister={() => setShowRegister(true)} />;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>基本情報技術者学習アプリ</h1>
        <div>
          <span style={{ marginRight: '10px' }}>ようこそ, {username}さん!</span>
          <button onClick={handleLogout} style={{ padding: '8px 16px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px' }}>
            ログアウト
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => setCurrentView('quiz')}
          style={{ 
            padding: '10px 20px', 
            marginRight: '10px',
            backgroundColor: currentView === 'quiz' ? '#2196F3' : '#e0e0e0',
            color: currentView === 'quiz' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          試験問題練習
        </button>
        <button 
          onClick={() => setCurrentView('it-terms')}
          style={{ 
            padding: '10px 20px',
            backgroundColor: currentView === 'it-terms' ? '#2196F3' : '#e0e0e0',
            color: currentView === 'it-terms' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          IT用語学習
        </button>
      </div>

      {currentView === 'quiz' ? <Quiz token={token} /> : <ITTerms token={token} />}
    </div>
  );
}

export default App;