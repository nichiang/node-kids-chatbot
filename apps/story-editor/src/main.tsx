import { useState } from "react";
import { createRoot } from "react-dom/client";
import { getThemeForTopic } from "@kids-chatbot/story-content";

function App() {
  const [topic, setTopic] = useState("space");
  const theme = getThemeForTopic(topic);

  return (
    <main>
      <h1>Story Editor Scaffold</h1>
      <p>Selected topic: {topic}</p>
      <p>Derived theme: {theme}</p>
      <button onClick={() => setTopic("fantasy")}>Use fantasy topic</button>
    </main>
  );
}

const container = document.getElementById("root");
if (container) {
  createRoot(container).render(<App />);
}
