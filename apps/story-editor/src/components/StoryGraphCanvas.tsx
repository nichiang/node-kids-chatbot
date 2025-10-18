import ReactFlow, { Background, Controls, MiniMap, useReactFlow } from "reactflow";
import { useCallback } from "react";
import { useStoryGraph } from "../state/use-story-graph";
import { nodeTypes } from "./nodes";
import type { StoryEditorNodeType } from "../graphs/node-types";
import { useSelection } from "../state/use-selection";

export function StoryGraphCanvas() {
  const graph = useStoryGraph((state) => state.graph);
  const setGraph = useStoryGraph((state) => state.setGraph);
  const reactFlowInstance = useReactFlow();
  const selectedNodeId = useSelection((state) => state.selectedNodeId);
  const setSelectedNodeId = useSelection((state) => state.setSelectedNodeId);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const nodeType = event.dataTransfer.getData("application/reactflow") as StoryEditorNodeType;
      if (!nodeType) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: `node-${Date.now()}`,
        type: nodeType,
        position,
        data: {},
      };

      setGraph({
        ...graph,
        nodes: [...graph.nodes, newNode],
      });
    },
    [graph, reactFlowInstance, setGraph],
  );

  return (
    <section className="graph-canvas">
      <ReactFlow
        nodes={graph.nodes}
        edges={graph.edges}
        fitView
        nodeTypes={nodeTypes}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onNodeClick={(_, node) => setSelectedNodeId(node.id)}
        onPaneClick={() => setSelectedNodeId(undefined)}
        selectedNodes={graph.nodes.filter((node) => node.id === selectedNodeId)}
      >
        <MiniMap />
        <Controls />
        <Background gap={16} color="#e1e1e1" />
      </ReactFlow>
    </section>
  );
}
