import React, { useState, useEffect, useCallback } from "react";
import "./game.css";

const QUESTIONS = [
  { q: "What does HTML stand for?", options: ["HyperText Markup Language", "High Tech Modern Language", "HyperText Machine Language", "Highly Typed Markup Logic"], ans: 0, cat: "Web" },
  { q: "Which keyword declares a variable in JavaScript that can't be reassigned?", options: ["var", "let", "const", "static"], ans: 2, cat: "JavaScript" },
  { q: "What is the output of `typeof null` in JavaScript?", options: ["null", "undefined", "object", "boolean"], ans: 2, cat: "JavaScript" },
  { q: "Which CSS property controls the text size?", options: ["text-size", "font-size", "text-style", "font-style"], ans: 1, cat: "CSS" },
  { q: "What does API stand for?", options: ["Application Programming Interface", "Automated Process Integration", "Advanced Programming Input", "Application Process Index"], ans: 0, cat: "General" },
  { q: "Which array method adds an element to the END?", options: ["push()", "pop()", "shift()", "unshift()"], ans: 0, cat: "JavaScript" },
  { q: "In React, what hook manages state?", options: ["useEffect", "useRef", "useState", "useContext"], ans: 2, cat: "React" },
  { q: "Which HTTP method is used to CREATE a resource?", options: ["GET", "PUT", "DELETE", "POST"], ans: 3, cat: "HTTP" },
  { q: "CSS Flexbox: which property aligns items on the MAIN axis?", options: ["align-items", "justify-content", "flex-direction", "align-content"], ans: 1, cat: "CSS" },
  { q: "What does `===` check in JavaScript?", options: ["Value only", "Type only", "Value and type", "Reference"], ans: 2, cat: "JavaScript" },
  { q: "Which is NOT a valid React Hook?", options: ["useState", "useEffect", "useClass", "useRef"], ans: 2, cat: "React" },
  { q: "MongoDB stores data in what format?", options: ["SQL tables", "JSON-like documents", "CSV files", "XML files"], ans: 1, cat: "Database" },
  { q: "Which symbol starts a CSS comment?", options: ["//", "/* */", "<!-- -->", "#"], ans: 1, cat: "CSS" },
  { q: "What is the time complexity of binary search?", options: ["O(n)", "O(n²)", "O(log n)", "O(1)"], ans: 2, cat: "DSA" },
  { q: "In Node.js, what is `npm`?", options: ["Node Package Manager", "New Programming Method", "Node Process Monitor", "Network Protocol Manager"], ans: 0, cat: "Node.js" },
];

const TIMER_SECONDS = 20;
const CAT_COLORS = {
  Web: "#3b82f6", JavaScript: "#f59e0b", CSS: "#ec4899",
  React: "#06b6d4", HTTP: "#10b981", Database: "#8b5cf6",
  General: "#6366f1", "Node.js": "#22c55e", DSA: "#ef4444"
};

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

const StudyGame = () => {
  const [screen, setScreen] = useState("menu"); // menu | playing | result
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timer, setTimer] = useState(TIMER_SECONDS);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [timedOut, setTimedOut] = useState(false);

  const startGame = () => {
    const q = shuffle(QUESTIONS).slice(0, 10);
    setQuestions(q);
    setCurrent(0);
    setSelected(null);
    setScore(0);
    setAnswers([]);
    setTimer(TIMER_SECONDS);
    setStreak(0);
    setMaxStreak(0);
    setTimedOut(false);
    setScreen("playing");
  };

  // Timer
  useEffect(() => {
    if (screen !== "playing" || selected !== null) return;
    if (timer <= 0) {
      setTimedOut(true);
      setSelected(-1);
      setAnswers(prev => [...prev, { correct: false, timedOut: true }]);
      setStreak(0);
      setTimeout(() => nextQuestion(), 1500);
      return;
    }
    const id = setTimeout(() => setTimer(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timer, screen, selected]);

  const nextQuestion = useCallback(() => {
    setCurrent(prev => {
      if (prev + 1 >= questions.length) {
        setScreen("result");
        return prev;
      }
      setSelected(null);
      setTimedOut(false);
      setTimer(TIMER_SECONDS);
      return prev + 1;
    });
  }, [questions.length]);

  const handleAnswer = (idx) => {
    if (selected !== null) return;
    setSelected(idx);
    const isCorrect = idx === questions[current].ans;

    if (isCorrect) {
      setScore(s => s + 10 + Math.ceil(timer / 2)); // Bonus for speed
      setStreak(s => {
        const ns = s + 1;
        setMaxStreak(m => Math.max(m, ns));
        return ns;
      });
    } else {
      setStreak(0);
    }

    setAnswers(prev => [...prev, { correct: isCorrect, timedOut: false }]);
    setTimeout(() => nextQuestion(), 1200);
  };

  const q = questions[current];
  const progress = questions.length ? ((current) / questions.length) * 100 : 0;
  const timerPct = (timer / TIMER_SECONDS) * 100;
  const timerColor = timer > 10 ? "#10b981" : timer > 5 ? "#f59e0b" : "#ef4444";

  if (screen === "menu") {
    return (
      <div className="game-page">
        <div className="game-menu">
          <div className="game-menu-icon">🎮</div>
          <h1>Code Master Quiz</h1>
          <p>Test your programming knowledge with 10 questions. Answer fast for bonus points!</p>

          <div className="game-rules">
            <div className="rule-item"><span>⏱</span> {TIMER_SECONDS}s per question</div>
            <div className="rule-item"><span>⚡</span> Speed bonus points</div>
            <div className="rule-item"><span>🔥</span> Build your streak</div>
            <div className="rule-item"><span>📊</span> 10 random questions</div>
          </div>

          <div className="topics-row">
            {Object.entries(CAT_COLORS).map(([cat, color]) => (
              <span key={cat} className="topic-chip" style={{ background: color }}>{cat}</span>
            ))}
          </div>

          <button className="game-start-btn" onClick={startGame}>
            🚀 Start Quiz!
          </button>
        </div>
      </div>
    );
  }

  if (screen === "result") {
    const total = questions.length * (10 + TIMER_SECONDS / 2);
    const pct = Math.round((score / (questions.length * 10)) * 100);
    const correctCount = answers.filter(a => a.correct).length;
    const grade =
      correctCount >= 9 ? { label: "🏆 Genius!", color: "#f59e0b" } :
      correctCount >= 7 ? { label: "🎉 Excellent!", color: "#10b981" } :
      correctCount >= 5 ? { label: "👍 Good Job!", color: "#3b82f6" } :
      correctCount >= 3 ? { label: "📚 Keep Studying!", color: "#8b5cf6" } :
      { label: "💪 Try Again!", color: "#ef4444" };

    return (
      <div className="game-page">
        <div className="game-result">
          <div className="result-grade" style={{ color: grade.color }}>{grade.label}</div>

          <div className="result-score-circle">
            <svg viewBox="0 0 120 120" className="score-svg">
              <circle cx="60" cy="60" r="54" fill="none" stroke="var(--border-light)" strokeWidth="10" />
              <circle
                cx="60" cy="60" r="54" fill="none" stroke={grade.color}
                strokeWidth="10"
                strokeDasharray={`${339.3 * pct / 100} 339.3`}
                strokeLinecap="round"
                transform="rotate(-90 60 60)"
                style={{ transition: "stroke-dasharray 1s ease" }}
              />
            </svg>
            <div className="score-inner">
              <div className="score-num">{score}</div>
              <div className="score-label">pts</div>
            </div>
          </div>

          <div className="result-stats">
            <div className="rstat"><span className="rstat-num" style={{ color: "#10b981" }}>{correctCount}</span><span>Correct</span></div>
            <div className="rstat"><span className="rstat-num" style={{ color: "#ef4444" }}>{questions.length - correctCount}</span><span>Wrong</span></div>
            <div className="rstat"><span className="rstat-num" style={{ color: "#f59e0b" }}>{maxStreak}</span><span>Max Streak</span></div>
          </div>

          {/* Question review */}
          <div className="result-review">
            <h3>Review Answers</h3>
            {questions.map((q, i) => (
              <div key={i} className={`review-item ${answers[i]?.correct ? "correct" : "wrong"}`}>
                <div className="review-icon">{answers[i]?.correct ? "✅" : "❌"}</div>
                <div className="review-body">
                  <div className="review-q">{q.q}</div>
                  <div className="review-ans">
                    <span style={{ color: "#10b981" }}>✓ {q.options[q.ans]}</span>
                    {!answers[i]?.correct && answers[i]?.timedOut && (
                      <span style={{ color: "#ef4444", marginLeft: 8 }}>(Time out!)</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="result-actions">
            <button className="game-start-btn" onClick={startGame}>🔄 Play Again</button>
            <button className="game-back-btn" onClick={() => setScreen("menu")}>🏠 Menu</button>
          </div>
        </div>
      </div>
    );
  }

  // Playing screen
  return (
    <div className="game-page">
      <div className="game-play">
        {/* Top bar */}
        <div className="game-topbar">
          <div className="game-score-badge">⭐ {score} pts</div>
          <div className="game-progress-text">{current + 1} / {questions.length}</div>
          {streak >= 2 && <div className="streak-badge">🔥 {streak} streak!</div>}
        </div>

        {/* Progress bar */}
        <div className="game-progress-bar">
          <div className="game-progress-fill" style={{ width: `${progress}%` }} />
        </div>

        {/* Timer */}
        <div className="timer-wrapper">
          <div className="timer-bar" style={{ width: `${timerPct}%`, background: timerColor }} />
          <div className="timer-num" style={{ color: timerColor }}>⏱ {timer}s</div>
        </div>

        {/* Question card */}
        <div className="question-card">
          <div className="q-category" style={{ background: CAT_COLORS[q.cat] || "#8a4baf" }}>
            {q.cat}
          </div>
          <h2 className="question-text">{q.q}</h2>
        </div>

        {/* Options */}
        <div className="options-grid">
          {q.options.map((opt, i) => {
            let cls = "option-btn";
            if (selected !== null) {
              if (i === q.ans) cls += " correct";
              else if (i === selected && selected !== q.ans) cls += " wrong";
            }
            return (
              <button key={i} className={cls} onClick={() => handleAnswer(i)} disabled={selected !== null}>
                <span className="opt-letter">{String.fromCharCode(65 + i)}</span>
                {opt}
              </button>
            );
          })}
        </div>

        {timedOut && (
          <div className="timeout-msg">⏰ Time's up! The answer was: <strong>{q.options[q.ans]}</strong></div>
        )}
      </div>
    </div>
  );
};

export default StudyGame;
