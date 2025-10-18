import { ReactFlowProvider } from "reactflow";
import { NodePalette } from "./components/NodePalette";
import { StoryGraphCanvas } from "./components/StoryGraphCanvas";
import { GraphControls } from "./components/GraphControls";

import "reactflow/dist/style.css";
import "./styles.css";

export function App() {
  return (
    <ReactFlowProvider>
      <div className="app-shell">
        <NodePalette />
        <div className="canvas-panel">
          <GraphControls />
          <StoryGraphCanvas />
        </div>
      </div>
    </ReactFlowProvider>
  );
}
