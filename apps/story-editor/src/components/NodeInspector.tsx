import { useMemo } from "react";
import type { StoryGraphNode } from "../graphs/node-types";
import { useStoryGraph } from "../state/use-story-graph";
import { useSelection } from "../state/use-selection";

export function NodeInspector() {
  const graph = useStoryGraph((state) => state.graph);
  const selectedNodeId = useSelection((state) => state.selectedNodeId);
  const setGraph = useStoryGraph((state) => state.setGraph);

  const node = useMemo(
    () => graph.nodes.find((n) => n.id === selectedNodeId),
    [graph.nodes, selectedNodeId],
  );

  if (!node) {
    return (
      <section className="node-inspector">
        <h2>Inspector</h2>
        <p>Select a node to edit its properties.</p>
      </section>
    );
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    const updatedNode: StoryGraphNode = {
      ...node,
      data: {
        ...node.data,
        [name]: value,
      },
    };

    setGraph({
      ...graph,
      nodes: graph.nodes.map((n) => (n.id === node.id ? updatedNode : n)),
    });
  };

  return (
    <section className="node-inspector">
      <h2>Inspector</h2>
      <div className="field">
        <label>Node ID</label>
        <input value={node.id} disabled />
      </div>
      <div className="field">
        <label>Node Type</label>
        <input value={node.type} disabled />
      </div>
      <div className="field">
        <label>Description</label>
        <textarea
          name="description"
          value={(node.data?.description as string) ?? ""}
          onChange={handleChange}
          rows={3}
        />
      </div>
      <div className="field">
        <label>Prompt Ref</label>
        <input
          name="promptRef"
          value={(node.data?.promptRef as string) ?? ""}
          onChange={handleChange}
        />
      </div>
    </section>
  );
}
