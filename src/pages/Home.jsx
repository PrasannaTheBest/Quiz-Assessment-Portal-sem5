import { Link } from "react-router-dom";
import { quizzes } from "../data/quizzes.js";

export default function Home() {
  return (
    <>
      <h1>Choose a quiz</h1>
      <p className="muted">Answer all questions before the timer runs out.</p>
      <div className="grid">
        {quizzes.map((q) => {
          let best = null;
          try {
            best = localStorage.getItem(`best-${q.id}`);
          } catch {}
          return (
            <div className="card" key={q.id}>
              <h2>{q.title}</h2>
              <p>{q.description}</p>
              <p className="muted">
                {q.questions.length} questions · {Math.round(q.timeLimit / 60 * 10) / 10} min
              </p>
              {best !== null && <p className="best">🏆 Best: {best}/{q.questions.length}</p>}
              <Link to={`/quiz/${q.id}`} className="btn">Start quiz</Link>
            </div>
          );
        })}
      </div>
    </>
  );
}
