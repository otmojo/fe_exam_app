import React, { useState, useEffect } from 'react';

function Quiz({ token }) {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState([]);
  const [showStatistics, setShowStatistics] = useState(false);
  const [recommendedTerms, setRecommendedTerms] = useState([]);
  const [showRecommendations, setShowRecommendations] = useState(false);

  // 从token中解析用户ID
  const getUserId = () => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId;
    } catch (error) {
      console.error('ユーザーIDの取得に失敗:', error);
      return null;
    }
  };

  useEffect(() => {
    fetchQuestions();
    fetchStatistics();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/questions');
      const data = await response.json();
      setQuestions(data);
      setLoading(false);
    } catch (error) {
      console.error('問題の取得に失敗:', error);
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    const userId = getUserId();
    if (!userId) return;

    try {
      const response = await fetch(`http://localhost:5000/api/statistics/${userId}`);
      const data = await response.json();
      setStatistics(data);
    } catch (error) {
      console.error('統計の取得に失敗:', error);
    }
  };

  const fetchRecommendedTerms = async () => {
    const userId = getUserId();
    if (!userId) return;

    try {
      const response = await fetch(`http://localhost:5000/api/recommended-terms/${userId}`);
      const data = await response.json();
      setRecommendedTerms(data);
    } catch (error) {
      console.error('推奨用語の取得に失敗:', error);
    }
  };

  const saveAnswer = async (questionId, userAnswer, isCorrect, category) => {
    const userId = getUserId();
    if (!userId) return;

    try {
      await fetch('http://localhost:5000/api/answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          questionId,
          userAnswer,
          isCorrect,
          category
        })
      });
    } catch (error) {
      console.error('回答の記録に失敗:', error);
    }
  };

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
  };

  const handleSubmit = async () => {
    if (!selectedAnswer) return;

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.answer;
    
    if (isCorrect) {
      setScore(score + 1);
    }

    // 保存答题记录
    await saveAnswer(
      currentQuestion.id,
      selectedAnswer,
      isCorrect,
      currentQuestion.category
    );

    setShowResult(true);
  };

  const handleNext = () => {
    setSelectedAnswer('');
    setShowResult(false);
    setCurrentQuestionIndex(currentQuestionIndex + 1);
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer('');
    setShowResult(false);
    setScore(0);
    fetchQuestions();
    fetchStatistics();
  };

  const handleShowStatistics = async () => {
    await fetchStatistics();
    setShowStatistics(true);
    setShowRecommendations(false);
  };

  const handleShowRecommendations = async () => {
    await fetchRecommendedTerms();
    setShowRecommendations(true);
    setShowStatistics(false);
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '20px' }}>問題を読み込み中...</div>;
  }

  if (questions.length === 0) {
    return <div style={{ textAlign: 'center', padding: '20px' }}>問題がありません</div>;
  }

  if (currentQuestionIndex >= questions.length) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <h2>練習完了！</h2>
        <p>あなたの得点: {score} / {questions.length}</p>
        <p>正答率: {Math.round((score / questions.length) * 100)}%</p>
        
        <div style={{ marginTop: '20px' }}>
          <button 
            onClick={handleShowStatistics}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#2196F3', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            学習統計を見る
          </button>
          
          <button 
            onClick={handleShowRecommendations}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#4CAF50', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            推奨IT用語
          </button>
          
          <button 
            onClick={handleRestart}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#ff9800', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            もう一度始める
          </button>
        </div>

        {showStatistics && (
          <div style={{ marginTop: '20px', textAlign: 'left' }}>
            <h3>学習統計</h3>
            {statistics.length > 0 ? (
              <div>
                {statistics.map((stat, index) => (
                  <div key={index} style={{ 
                    padding: '10px', 
                    margin: '5px 0', 
                    backgroundColor: '#f5f5f5', 
                    borderRadius: '4px' 
                  }}>
                    <h4>{stat.category}</h4>
                    <p>総問題数: {stat.total}</p>
                    <p>正解: {stat.correct} | 不正解: {stat.incorrect}</p>
                    <p>正答率: {((stat.correct / stat.total) * 100).toFixed(1)}%</p>
                    <p>誤答率: {stat.errorRate}%</p>
                  </div>
                ))}
              </div>
            ) : (
              <p>まだ統計データがありません</p>
            )}
          </div>
        )}

        {showRecommendations && (
          <div style={{ marginTop: '20px', textAlign: 'left' }}>
            <h3>推奨IT用語</h3>
            {recommendedTerms.recommendedTerms && recommendedTerms.recommendedTerms.length > 0 ? (
              <div>
                {recommendedTerms.highErrorCategories && recommendedTerms.highErrorCategories.length > 0 && (
                  <div style={{ marginBottom: '15px' }}>
                    <h4>改善が必要な分野:</h4>
                    {recommendedTerms.highErrorCategories.map((category, index) => (
                      <span key={index} style={{ 
                        display: 'inline-block',
                        padding: '5px 10px',
                        margin: '2px',
                        backgroundColor: '#ffebee',
                        color: '#c62828',
                        borderRadius: '4px',
                        fontSize: '0.9em'
                      }}>
                        {category.category} ({category.errorRate}%)
                      </span>
                    ))}
                  </div>
                )}
                
                <h4>推奨用語:</h4>
                {recommendedTerms.recommendedTerms.map((term, index) => (
                  <div key={index} style={{ 
                    padding: '10px', 
                    margin: '5px 0', 
                    backgroundColor: '#e8f5e8', 
                    borderRadius: '4px' 
                  }}>
                    <strong>{term.term}</strong> ({term.category})
                    <p>{term.meaning}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p>推奨用語がありません</p>
            )}
          </div>
        )}
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
      <div style={{ marginBottom: '20px' }}>
        <span>問題 {currentQuestionIndex + 1} / {questions.length}</span>
        <span style={{ float: 'right' }}>得点: {score}</span>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <span style={{ 
          padding: '4px 8px', 
          backgroundColor: '#2196F3', 
          color: 'white', 
          borderRadius: '4px',
          fontSize: '0.8em'
        }}>
          {currentQuestion.category}
        </span>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>{currentQuestion.question}</h3>
      </div>

      <div style={{ marginBottom: '20px' }}>
        {currentQuestion.options.map((option, index) => (
          <div 
            key={index}
            onClick={() => !showResult && handleAnswerSelect(option)}
            style={{
              padding: '10px',
              margin: '5px 0',
              backgroundColor: showResult 
                ? (option === currentQuestion.answer 
                    ? '#4CAF50' 
                    : (option === selectedAnswer ? '#f44336' : '#e0e0e0'))
                : (selectedAnswer === option ? '#2196F3' : '#e0e0e0'),
              color: showResult 
                ? (option === currentQuestion.answer || option === selectedAnswer ? 'white' : 'black')
                : (selectedAnswer === option ? 'white' : 'black'),
              borderRadius: '4px',
              cursor: showResult ? 'default' : 'pointer',
              border: '1px solid #ddd'
            }}
          >
            {String.fromCharCode(65 + index)}. {option}
          </div>
        ))}
      </div>

      {showResult && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: selectedAnswer === currentQuestion.answer ? '#e8f5e8' : '#ffebee',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          <p><strong>
            {selectedAnswer === currentQuestion.answer ? '✓ 正解！' : '✗ 不正解！'}
          </strong></p>
          <p><strong>正解:</strong> {currentQuestion.answer}</p>
          {currentQuestion.explanation && (
            <p><strong>解説:</strong> {currentQuestion.explanation}</p>
          )}
        </div>
      )}

      <div>
        {!showResult ? (
          <button 
            onClick={handleSubmit}
            disabled={!selectedAnswer}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: selectedAnswer ? '#4CAF50' : '#ccc', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: selectedAnswer ? 'pointer' : 'not-allowed'
            }}
          >
            回答を送信
          </button>
        ) : (
          <button 
            onClick={handleNext}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#2196F3', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            次の問題
          </button>
        )}
      </div>
    </div>
  );
}

export default Quiz; 