export default function QuestionPalette({ total, current, answers, onJump }) {
  return (
    <div className="palette">
      {Array.from({ length: total }, (_, i) => {
        const cls = [
          "palette-btn",
          i === current ? "current" : "",
          answers[i] !== null ? "answered" : "",
        ].join(" ");
        return (
          <button key={i} className={cls} onClick={() => onJump(i)} aria-label={`Go to question ${i + 1}`}>
            {i + 1}
          </button>
        );
      })}
    </div>
  );
}
