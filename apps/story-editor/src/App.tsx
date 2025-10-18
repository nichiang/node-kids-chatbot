import { ReactFlowProvider } from "reactflow";
import { NodePalette } from "./components/NodePalette";
import { StoryGraphCanvas } from "./components/StoryGraphCanvas";

import "reactflow/dist/style.css";
import "./styles.css";

export function App() {
  return (
    <ReactFlowProvider>
      <div className="app-shell">
        <NodePalette />
        <StoryGraphCanvas />
      </div>
    </ReactFlowProvider>
  );
}
