import React, { useEffect, useState } from 'react';
import './App.css';

const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F'];

function App() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [results, setResults] = useState([]);
  const [current, setCurrent] = useState(0);
  const [showFinalAnswers, setShowFinalAnswers] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch 10 random questions from the API
    const fetchQuestions = async () => {
      setLoading(true);
      setError(null);
      try {
        const questionPromises = Array.from({ length: 10 }, () =>
          fetch('https://aptitude-api.vercel.app/Random').then(res => res.json())
        );
        const data = await Promise.all(questionPromises);
        // Remove duplicates by question text
        const unique = [];
        const seen = new Set();
        for (const q of data) {
          if (!seen.has(q.question)) {
            seen.add(q.question);
            unique.push(q);
          }
          if (unique.length === 10) break;
        }
        setQuestions(unique);
        setAnswers([]);
        setResults([]);
        setSubmitted(false);
        setShowAnswers(false);
      } catch (err) {
        setError('Failed to load questions. Please check your internet connection or try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  const handleSelect = (idx) => {
    setAnswers(prev => {
      const copy = [...prev];
      copy[current] = idx;
      return copy;
    });
  };

  const handleSubmit = () => {
    if (!username) {
      alert('Please enter your username.');
      return;
    }
    const q = questions[current];
    const answer = answers[current];
    setResults(prev => {
      const copy = [...prev];
      copy[current] = (answer === q.options.indexOf(q.answer) || answer === q.answer);
      return copy;
    });
    setSubmitted(true);
  };

  const handleNext = () => {
    if (current < questions.length - 1) {
      setCurrent(prev => prev + 1);
      setSubmitted(false);
      setShowAnswers(false);
    } else {
      setShowFinalAnswers(true);
    }
  };

  const handleShowAnswers = () => {
    setShowAnswers(true);
  };

  if (loading) return <div className="App">Loading...</div>;
  if (error) return <div className="App"><div style={{color: 'red', marginBottom: 16}}>{error}</div><button onClick={() => window.location.reload()}>Retry</button></div>;
  if (!questions.length) return <div className="App">No questions today.</div>;

  return (
    <div className="App">
      <h2>Daily Aptitude Challenge</h2>
      <input
        type="text"
        placeholder="Enter your username"
        value={username}
        onChange={e => setUsername(e.target.value)}
        disabled={submitted || showFinalAnswers}
        style={{ marginBottom: 16, padding: 6, fontSize: 16 }}
      />
      {!showFinalAnswers ? (
        !submitted ? (
          <div className="question-block">
            <div className="question">{questions[current].question || questions[current].text}</div>
            <div className="options">
              {questions[current].options.map((opt, idx) => (
                <label key={idx}>
                  <input
                    type="radio"
                    name={`option-${questions[current].id || current}`}
                    value={idx}
                    checked={answers[current] === idx}
                    onChange={() => handleSelect(idx)}
                    disabled={submitted}
                  />
                  <b>{optionLabels[idx]}.</b> {opt}
                  {showAnswers && (questions[current].answer === idx || questions[current].options[questions[current].answer] === opt) && (
                    <span className="correct" style={{ marginLeft: 8 }}>
                      (Correct Answer)
                    </span>
                  )}
                </label>
              ))}
            </div>
            {results[current] !== undefined && (
              <div className={results[current] ? 'correct' : 'incorrect'}>
                {results[current] ? 'Correct!' : 'Incorrect.'}
              </div>
            )}
            <button
              onClick={handleSubmit}
              disabled={answers[current] === undefined || results[current] !== undefined}
              style={{ marginTop: 16 }}
            >
              Submit
            </button>
          </div>
        ) : (
          <div style={{ marginTop: 16 }}>
            <h3>Results</h3>
            <div style={{ marginBottom: 10 }}>
              <span>{questions[current].question || questions[current].text}</span>
              <div className="options" style={{ marginTop: 6 }}>
                {questions[current].options.map((opt, oidx) => (
                  <div key={oidx} style={{
                    fontWeight: answers[current] === oidx ? 'bold' : 'normal',
                    color: answers[current] === oidx ? '#007bff' : '#222',
                    background: answers[current] === oidx ? 'rgba(0,123,255,0.07)' : 'none',
                    borderRadius: 4,
                    padding: '2px 6px',
                    display: 'inline-block',
                    marginBottom: 2
                  }}>
                    <b>{optionLabels[oidx]}.</b> {opt}
                    {answers[current] === oidx && !results[current] && (
                      <span className="incorrect" style={{ marginLeft: 8 }}>
                        (Your Choice)
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {current < questions.length - 1 && (
              <button style={{ marginTop: 16 }} onClick={handleNext}>
                Next Question
              </button>
            )}
            {current === questions.length - 1 && !showAnswers && (
              <button style={{ marginTop: 16 }} onClick={handleShowAnswers}>
                Show All Correct Answers
              </button>
            )}
            {current === questions.length - 1 && showAnswers && (
              <div style={{ marginTop: 24 }}>
                <h3>All Correct Answers</h3>
                <div className="answers-summary">
                  {questions.map((q, idx) => {
                    const userIdx = answers[idx];
                    const correctIdx = typeof q.answer === 'number' ? q.answer : q.options.indexOf(q.answer);
                    return (
                      <div key={idx} className="summary-row" style={{
                        marginBottom: 14,
                        background: userIdx === correctIdx ? 'rgba(28,169,78,0.08)' : 'rgba(255,0,0,0.06)',
                        borderRadius: 6,
                        padding: 8
                      }}>
                        <div style={{ fontWeight: 'bold' }}>{idx + 1}. {q.question || q.text}</div>
                        <div style={{ marginTop: 4 }}>
                          <span style={{ color: '#1ca94e' }}>
                            Correct: <b>{optionLabels[correctIdx]}. {q.options[correctIdx]}</b>
                          </span>
                          {userIdx !== undefined && (
                            <span style={{ marginLeft: 16, color: userIdx === correctIdx ? '#1ca94e' : '#d32f2f' }}>
                              Your Answer: <b>{optionLabels[userIdx]}. {q.options[userIdx]}</b>
                            </span>
                          )}
                          {userIdx === undefined && (
                            <span style={{ marginLeft: 16, color: '#888' }}>
                              Not Answered
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )
      ) : (
        <div style={{ marginTop: 16 }}>
          <h3>All Correct Answers</h3>
          <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: '#1ca94e' }}>
            Score: {results.filter(r => r).length} / {questions.length}
          </div>
          {questions.map((q, idx) => (
            <div key={idx} style={{ marginBottom: 10 }}>
              <span>{q.question || q.text}</span>
              <div className="options" style={{ marginTop: 6 }}>
                {q.options.map((opt, oidx) => (
                  <div key={oidx} style={{
                    fontWeight: answers[idx] === oidx ? 'bold' : 'normal',
                    color: (q.answer === oidx || q.options[q.answer] === opt) ? '#1ca94e' : (answers[idx] === oidx ? '#007bff' : '#222'),
                    background: (q.answer === oidx || q.options[q.answer] === opt) ? 'rgba(28,169,78,0.08)' : (answers[idx] === oidx ? 'rgba(0,123,255,0.07)' : 'none'),
                    borderRadius: 4,
                    padding: '2px 6px',
                    display: 'inline-block',
                    marginBottom: 2
                  }}>
                    <b>{optionLabels[oidx]}.</b> {opt}
                    {(q.answer === oidx || q.options[q.answer] === opt) && (
                      <span className="correct" style={{ marginLeft: 8 }}>
                        (Correct Answer)
                      </span>
                    )}
                    {answers[idx] === oidx && !results[idx] && (q.answer !== oidx && q.options[q.answer] !== opt) && (
                      <span className="incorrect" style={{ marginLeft: 8 }}>
                        (Your Choice)
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 4, fontStyle: 'italic', color: '#555' }}>
                <b>Actual Answer:</b> {typeof q.answer === 'number' ? q.options[q.answer] : q.answer}
              </div>
              <span className={results[idx] ? 'correct' : 'incorrect'} style={{ marginLeft: 8 }}>
                {results[idx] ? 'Correct' : 'Incorrect'}
              </span>
            </div>
          ))}
          <div style={{ marginTop: 16, fontWeight: 'bold', color: '#007bff' }}>
            You have completed all 10 questions!
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
