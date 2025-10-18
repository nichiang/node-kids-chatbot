import ReactFlow, { Background, Controls, MiniMap, useReactFlow, applyNodeChanges, applyEdgeChanges } from "reactflow";
import { useCallback } from "react";
import { useStoryGraph } from "../state/use-story-graph";
import { nodeTypes } from "./nodes";
import type { StoryEditorNodeType } from "../graphs/node-types";
import { useSelection } from "../state/use-selection";

export function StoryGraphCanvas() {
  const graph = useStoryGraph((state) => state.graph);
  const setGraph = useStoryGraph((state) => state.setGraph);
  const updateGraph = useStoryGraph((state) => state.updateGraph);
  const reactFlowInstance = useReactFlow();
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

  const handleNodesChange = useCallback((changes) => {
    updateGraph((current) => ({
      ...current,
      nodes: applyNodeChanges(changes, current.nodes),
    }));
  }, [updateGraph]);

  const handleEdgesChange = useCallback((changes) => {
    updateGraph((current) => ({
      ...current,
      edges: applyEdgeChanges(changes, current.edges),
    }));
  }, [updateGraph]);

  return (
    <section className="graph-canvas">
      <ReactFlow
        nodes={graph.nodes}
        edges={graph.edges}
        fitView
        nodeTypes={nodeTypes}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onSelectionChange={(params) => setSelectedNodeId(params?.nodes?.[0]?.id)}
      >
        <MiniMap />
        <Controls />
        <Background gap={16} color="#e1e1e1" />
      </ReactFlow>
    </section>
  );
}
