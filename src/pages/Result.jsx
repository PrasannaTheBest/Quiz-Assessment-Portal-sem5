import { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";

function Confetti() {
  const colors = ["#3b4cca", "#16a34a", "#f59e0b", "#ef4444", "#06b6d4", "#a855f7"];
  return (
    <div className="confetti" aria-hidden="true">
      {Array.from({ length: 40 }, (_, i) => (
        <span
          key={i}
          style={{
            left: `${(i * 97) % 100}%`,
            background: colors[i % colors.length],
            animationDelay: `${(i % 10) * 0.15}s`,
            animationDuration: `${2.5 + (i % 5) * 0.4}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function Result({ result }) {
  const [shown, setShown] = useState(0);
  const target = result ? result.score : 0;

  // Count the score up from 0
  useEffect(() => {
    if (!result) return;
    setShown(0);
    let n = 0;
    const t = setInterval(() => {
      n += 1;
      setShown(n);
      if (n >= target) clearInterval(t);
    }, 250);
    return () => clearInterval(t);
  }, [result, target]);

  // Opening /result directly (no quiz taken) sends the user home
  if (!result) return <Navigate to="/" replace />;

  const { title, questions, answers, score, timeTaken, quizId } = result;
  const total = questions.length;
  const percent = Math.round((score / total) * 100);
  const attempted = answers.filter((a) => a !== null).length;
  const verdict = percent >= 80 ? "Excellent! 🎉" : percent >= 50 ? "Good effort 👍" : "Keep practising 💪";

  return (
    <>
      <h1>Result: {title}</h1>
      {percent >= 80 && <Confetti />}
      <div className="card summary pop-in">
        <div className="score">{shown}/{total}</div>
        <p className="verdict">{verdict} ({percent}%)</p>
        <p className="muted">
          Correct: {score} · Wrong: {attempted - score} · Skipped: {total - attempted} · Time: {timeTaken}s
        </p>
        <div className="nav-row">
          <Link to={`/quiz/${quizId}`} className="btn">Retry</Link>
          <Link to="/" className="btn secondary">All quizzes</Link>
        </div>
      </div>

      <h2>Review</h2>
      {questions.map((q, i) => {
        const given = answers[i];
        const correct = given === q.answer;
        return (
          <div style={{ animationDelay: `${i * 80}ms` }} className={`card review fade-up ${given === null ? "skipped" : correct ? "right" : "wrong"}`} key={i}>
            <p><strong>Q{i + 1}.</strong> {q.question}</p>
            <p>Your answer: {given === null ? <em>Skipped</em> : q.options[given]} {given !== null && (correct ? "✅" : "❌")}</p>
            {!correct && <p>Correct answer: <strong>{q.options[q.answer]}</strong></p>}
          </div>
        );
      })}
    </>
  );
}
