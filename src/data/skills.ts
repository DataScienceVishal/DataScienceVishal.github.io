/**
 * Grouped by area, and every item names where it was used. A skill with no
 * project or role to point at is not on this list, which is why several on the
 * CV are not.
 */

export interface Skill {
  name: string;
  where: string;
}

export const SKILLS: Array<{ area: string; items: Skill[] }> = [
  {
    area: "Evaluation",
    items: [
      { name: "Pre-registered checks", where: "trail-scorer-audit, twicerun" },
      { name: "Baselines and intervals", where: "lesion-split, twicerun" },
      { name: "Leakage and split design", where: "lesion-split" },
    ],
  },
  {
    area: "LLM systems",
    items: [
      { name: "RAG over ChromaDB", where: "the twin" },
      { name: "Azure OpenAI", where: "the twin" },
      { name: "MCP", where: "untrusted-rows" },
      { name: "Prompt-injection handling", where: "the twin, untrusted-rows" },
    ],
  },
  {
    area: "Data",
    items: [
      { name: "Databricks", where: "Teleperformance" },
      { name: "SQL Server to Databricks", where: "Teleperformance" },
      { name: "DuckDB", where: "twicerun, untrusted-rows" },
      { name: "pandas", where: "women in chess" },
    ],
  },
  {
    area: "Machine learning",
    items: [
      { name: "PyTorch", where: "lesion-split" },
      { name: "scikit-learn, XGBoost", where: "UK HE completion risk" },
      { name: "TensorFlow, Keras", where: "CIFAR-10" },
      { name: "DQN, A2C, PPO", where: "LJMU dissertation" },
    ],
  },
  {
    area: "Engineering",
    items: [
      { name: "Python, pytest, offline CI", where: "every entry here" },
      { name: "FastAPI, SSE", where: "the twin" },
      { name: "React 19, TypeScript", where: "the twin, this site" },
      { name: "Docker", where: "the twin's backend image" },
    ],
  },
];
