import { FormEvent, useState } from "react";
import { useSimulation } from "../state/use-session";

export function SimulationPanel() {
  const {
    sessionData,
    setSessionData,
    storyApiUrl,
    setStoryApiUrl,
    isLoading,
    setIsLoading,
    lastResponse,
    setLastResponse,
  } = useSimulation();
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!message.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${storyApiUrl.replace(/\/$/, "")}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, sessionData }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        setLastResponse(`Error ${response.status}: ${errorText}`);
        return;
      }

      const payload = (await response.json()) as {
        response: string;
        sessionData?: unknown;
      };
      setLastResponse(payload.response);
      setSessionData(payload.sessionData);
      setMessage("");
    } catch (error) {
      setLastResponse(`Request failed: ${String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="simulation-panel">
      <h2>Simulation</h2>
      <div className="api-config">
        <label>
          Story API URL
          <input
            type="text"
            value={storyApiUrl}
            onChange={(event) => setStoryApiUrl(event.target.value)}
          />
        </label>
      </div>

      <form className="simulation-form" onSubmit={handleSubmit}>
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Send a message to the story API"
          rows={3}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Sending..." : "Send"}
        </button>
        <button
          type="button"
          onClick={() => {
            setSessionData(undefined);
            setLastResponse(undefined);
          }}
        >
          Reset Session
        </button>
      </form>

      <div className="simulation-output">
        <h3>Response</h3>
        <pre>{lastResponse ?? "(No response yet)"}</pre>
      </div>
    </section>
  );
}
