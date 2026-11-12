import { useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Quiz from "./pages/Quiz.jsx";
import Result from "./pages/Result.jsx";

export default function App() {
  // Result of the most recently finished quiz, shared between /quiz/:id and /result
  const [result, setResult] = useState(null);

  return (
    <div className="app">
      <header className="navbar">
        <Link to="/" className="brand">🎓 Quiz Portal</Link>
      </header>
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/quiz/:id" element={<Quiz onFinish={setResult} />} />
          <Route path="/result" element={<Result result={result} />} />
          <Route path="*" element={<p>Page not found. <Link to="/">Go home</Link></p>} />
        </Routes>
      </main>
    </div>
  );
}
