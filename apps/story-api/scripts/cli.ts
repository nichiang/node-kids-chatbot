import readline from "readline/promises";
import { stdin as input, stdout as output } from "process";

const API_URL = process.env.STORY_API_URL ?? "http://localhost:3000";

async function main() {
  const rl = readline.createInterface({ input, output });
  let sessionData: unknown;

  console.log("Story API CLI. Type messages to chat, or 'exit' to quit.\n");

  try {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const message = await rl.question("> ");
      if (!message || message.toLowerCase() === "exit") {
        break;
      }

      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, sessionData }),
      });

      if (!response.ok) {
        console.error("Server returned", response.status, await response.text());
        continue;
      }

      const payload = (await response.json()) as {
        response: string;
        sessionData: unknown;
      };

      console.log("\n🤖 ", payload.response, "\n");
      sessionData = payload.sessionData;
    }
  } finally {
    rl.close();
  }
}

main().catch((err) => {
  console.error("CLI error", err);
  process.exit(1);
});
