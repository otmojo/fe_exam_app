import React, { useState, useEffect } from 'react';

function ITTerms({ token }) {
  const [itTerms, setItTerms] = useState([]);
  const [currentTermIndex, setCurrentTermIndex] = useState(0);
  const [showMeaning, setShowMeaning] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchITTerms();
  }, []);

  const fetchITTerms = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/it-terms');
      const data = await response.json();
      setItTerms(data);
      setLoading(false);
    } catch (error) {
      console.error('IT用語の取得に失敗:', error);
      setLoading(false);
    }
  };

  const handleNext = () => {
    setShowMeaning(false);
    setCurrentTermIndex((prevIndex) => (prevIndex + 1) % itTerms.length);
  };

  const handlePrevious = () => {
    setShowMeaning(false);
    setCurrentTermIndex((prevIndex) => 
      prevIndex === 0 ? itTerms.length - 1 : prevIndex - 1
    );
  };

  const handleRestart = () => {
    setCurrentTermIndex(0);
    setShowMeaning(false);
    fetchITTerms();
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '20px' }}>IT用語を読み込み中...</div>;
  }

  if (itTerms.length === 0) {
    return <div style={{ textAlign: 'center', padding: '20px' }}>IT用語がありません</div>;
  }

  const currentTerm = itTerms[currentTermIndex];

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <span>IT用語 {currentTermIndex + 1} / {itTerms.length}</span>
      </div>

      <div style={{ 
        backgroundColor: 'white', 
        padding: '40px', 
        borderRadius: '8px', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        textAlign: 'center',
        minHeight: '300px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '2em', margin: '0 0 10px 0' }}>{currentTerm.term}</h2>
          <span style={{ 
            padding: '4px 12px', 
            backgroundColor: '#2196F3',
            color: 'white',
            borderRadius: '12px',
            fontSize: '0.9em'
          }}>
            {currentTerm.category}
          </span>
        </div>

        {showMeaning ? (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#2196F3', margin: '0 0 10px 0' }}>意味</h3>
              <p style={{ fontSize: '1.2em', lineHeight: '1.6' }}>{currentTerm.meaning}</p>
            </div>
            
            {currentTerm.example && (
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ color: '#666', margin: '0 0 10px 0' }}>例文</h4>
                <p style={{ fontStyle: 'italic', color: '#666' }}>"{currentTerm.example}"</p>
              </div>
            )}
          </div>
        ) : (
          <div>
            <p style={{ fontSize: '1.1em', color: '#666' }}>下のボタンをクリックして意味を表示</p>
          </div>
        )}

        <div style={{ marginTop: '30px' }}>
          <button 
            onClick={() => setShowMeaning(!showMeaning)}
            style={{ 
              padding: '12px 24px', 
              backgroundColor: showMeaning ? '#ff9800' : '#2196F3', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1em',
              marginRight: '10px'
            }}
          >
            {showMeaning ? '意味を隠す' : '意味を表示'}
          </button>
        </div>
      </div>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <button 
          onClick={handlePrevious}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#666', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          前へ
        </button>
        
        <button 
          onClick={handleNext}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#4CAF50', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          次へ
        </button>
        
        <button 
          onClick={handleRestart}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#9C27B0', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          最初から
        </button>
      </div>
    </div>
  );
}

export default ITTerms; 