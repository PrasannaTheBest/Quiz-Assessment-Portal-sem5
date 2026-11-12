const pad = (n) => String(n).padStart(2, "0");

export default function Timer({ secondsLeft }) {
  const m = Math.floor(secondsLeft / 60);
  const s = secondsLeft % 60;
  return (
    <div className={`timer ${secondsLeft <= 15 ? "danger" : ""}`}>
      ⏱ {pad(m)}:{pad(s)}
    </div>
  );
}
