import { useStoryGraph } from "../state/use-story-graph";
import type { StoryGraphDefinition } from "../graphs/node-types";
import { demoGraph } from "../graphs/node-types";

export function GraphControls() {
  const { graph, setGraph } = useStoryGraph();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const text = await file.text();
    try {
      const parsed = JSON.parse(text) as StoryGraphDefinition;
      setGraph(parsed);
    } catch (error) {
      console.error("Invalid graph file", error);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(graph, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${graph.id ?? "story-graph"}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setGraph(demoGraph);
  };

  return (
    <section className="graph-controls">
      <h2>Graph Controls</h2>
      <button type="button" onClick={handleDownload}>
        Download Graph JSON
      </button>
      <button type="button" onClick={handleReset}>
        Reset to Demo
      </button>
      <label className="upload">
        Import Graph JSON
        <input type="file" accept="application/json" onChange={handleFileUpload} />
      </label>
    </section>
  );
}
