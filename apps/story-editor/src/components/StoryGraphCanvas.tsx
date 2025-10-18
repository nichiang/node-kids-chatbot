import ReactFlow, { Background, Controls, MiniMap } from "reactflow";
import { useStoryGraph } from "../state/use-story-graph";

export function StoryGraphCanvas() {
  const graph = useStoryGraph((state) => state.graph);

  return (
    <section className="graph-canvas">
      <ReactFlow nodes={graph.nodes} edges={graph.edges} fitView>
        <MiniMap />
        <Controls />
        <Background gap={16} color="#e1e1e1" />
      </ReactFlow>
    </section>
  );
}
