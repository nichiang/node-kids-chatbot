import ReactFlow, { Background, Controls, MiniMap } from "reactflow";
import { demoGraph } from "../graphs/node-types";

export function StoryGraphCanvas() {
  return (
    <section className="graph-canvas">
      <ReactFlow nodes={demoGraph.nodes} edges={demoGraph.edges} fitView>
        <MiniMap />
        <Controls />
        <Background gap={16} color="#e1e1e1" />
      </ReactFlow>
    </section>
  );
}
