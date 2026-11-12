import { Link, Navigate } from "react-router-dom";

export default function Result({ result }) {
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
      <div className="card summary">
        <div className="score">{score}/{total}</div>
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
          <div className={`card review ${given === null ? "skipped" : correct ? "right" : "wrong"}`} key={i}>
            <p><strong>Q{i + 1}.</strong> {q.question}</p>
            <p>Your answer: {given === null ? <em>Skipped</em> : q.options[given]} {given !== null && (correct ? "✅" : "❌")}</p>
            {!correct && <p>Correct answer: <strong>{q.options[q.answer]}</strong></p>}
          </div>
        );
      })}
    </>
  );
}
