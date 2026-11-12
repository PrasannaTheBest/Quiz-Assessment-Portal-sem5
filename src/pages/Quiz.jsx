import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getQuiz } from "../data/quizzes.js";
import Timer from "../components/Timer.jsx";
import QuestionPalette from "../components/QuestionPalette.jsx";

export default function Quiz({ onFinish }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const quiz = getQuiz(id);

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState(() => quiz ? Array(quiz.questions.length).fill(null) : []);
  const [secondsLeft, setSecondsLeft] = useState(quiz ? quiz.timeLimit : 0);

  // Keep the latest answers in a ref so the timer callback never reads stale state
  const answersRef = useRef(answers);
  answersRef.current = answers;
  const finished = useRef(false);

  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    const given = answersRef.current;
    const score = quiz.questions.reduce((n, q, i) => (given[i] === q.answer ? n + 1 : n), 0);
    try {
      const key = `best-${quiz.id}`;
      const prev = Number(localStorage.getItem(key));
      if (localStorage.getItem(key) === null || score > prev) localStorage.setItem(key, score);
    } catch {}
    onFinish({
      quizId: quiz.id,
      title: quiz.title,
      questions: quiz.questions,
      answers: given,
      score,
      timeTaken: quiz.timeLimit - secondsLeftRef.current,
    });
    navigate("/result");
  };

  // Countdown timer
  const secondsLeftRef = useRef(secondsLeft);
  secondsLeftRef.current = secondsLeft;

  useEffect(() => {
    if (!quiz) return;
    const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [quiz]);

  // Auto-submit when time is up
  useEffect(() => {
    if (quiz && secondsLeft <= 0) finish();
  }, [secondsLeft]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!quiz) return <p>Quiz not found. <Link to="/">Go home</Link></p>;

  const q = quiz.questions[current];
  const total = quiz.questions.length;
  const answeredCount = answers.filter((a) => a !== null).length;

  const select = (optIndex) =>
    setAnswers((prev) => prev.map((a, i) => (i === current ? optIndex : a)));

  const handleSubmit = () => {
    const unanswered = total - answeredCount;
    if (unanswered > 0 && !window.confirm(`${unanswered} question(s) unanswered. Submit anyway?`)) return;
    finish();
  };

  return (
    <div className="quiz">
      <div className="quiz-top">
        <div>
          <h1>{quiz.title}</h1>
          <p className="muted">Question {current + 1} of {total} · {answeredCount} answered</p>
        </div>
        <Timer secondsLeft={Math.max(secondsLeft, 0)} />
      </div>

      <div className="progress"><div className="bar" style={{ width: `${(answeredCount / total) * 100}%` }} /></div>

      <div className="card question slide-in" key={current}>
        <h2>{q.question}</h2>
        {q.options.map((opt, i) => (
          <label key={i} className={`option ${answers[current] === i ? "selected" : ""}`}>
            <input
              type="radio"
              name={`q-${current}`}
              checked={answers[current] === i}
              onChange={() => select(i)}
            />
            {opt}
          </label>
        ))}
      </div>

      <QuestionPalette total={total} current={current} answers={answers} onJump={setCurrent} />

      <div className="nav-row">
        <button className="btn secondary" disabled={current === 0} onClick={() => setCurrent((c) => c - 1)}>
          ← Previous
        </button>
        {current < total - 1 ? (
          <button className="btn" onClick={() => setCurrent((c) => c + 1)}>Next →</button>
        ) : (
          <button className="btn success" onClick={handleSubmit}>Submit quiz</button>
        )}
      </div>
    </div>
  );
}
