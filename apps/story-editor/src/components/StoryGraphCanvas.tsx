import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
} from "reactflow";
import { useCallback } from "react";
import { useStoryGraph } from "../state/use-story-graph";
import { nodeTypes } from "./nodes";
import type {
  StoryEditorNodeType,
  StoryGraphNode,
  StoryGraphEdge,
} from "../graphs/node-types";
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

      const newNode: StoryGraphNode = {
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

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      updateGraph((current) => {
        const nodes = applyNodeChanges(changes, current.nodes as any).map((node) => ({
          ...node,
          type: (node.type ?? "topic-classifier") as StoryEditorNodeType,
        })) as StoryGraphNode[];
        return {
          ...current,
          nodes,
        };
      });
    },
    [updateGraph],
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      updateGraph((current) => {
        const edges = applyEdgeChanges(changes, current.edges as any).map((edge) => ({
          ...edge,
          label: typeof edge.label === "string" ? edge.label : undefined,
        })) as StoryGraphEdge[];
        return {
          ...current,
          edges,
        };
      });
    },
    [updateGraph],
  );

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
