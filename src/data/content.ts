/**
 * Flat content. Prose that carries citations lives in the section components,
 * because a claim is a piece of typography and not a string.
 *
 * Source of truth for every fact here is the resume PDF in /public, plus the
 * public repositories it points at. Numbers keep whatever hedge the resume
 * gave them.
 */

export const CONTACT = {
  name: "Vishal Khan",
  email: "vishalkhan251@gmail.com",
  github: "https://github.com/DataScienceVishal",
  githubHandle: "DataScienceVishal",
  linkedin: "https://www.linkedin.com/in/vishalkhandatascience/",
  linkedinHandle: "in/vishalkhandatascience",
  location: "London, United Kingdom",
  twin: "https://ai-professional-twin.vercel.app/",
  twinRepo: "https://github.com/DataScienceVishal/ai-professional-twin",
} as const;

/** Subject line is prefilled so the mail client opens ready to send. */
export const CALL_MAILTO =
  "mailto:vishalkhan251@gmail.com" +
  "?subject=" +
  encodeURIComponent("Call about an AI/ML role") +
  "&body=" +
  encodeURIComponent(
    "Hi Vishal,\n\nI would like to set up a call. Here is the role and a couple of times that work:\n\n",
  );

/**
 * The hero's evidence artifact. See DESIGN.md section 10.
 *
 * To use a screen capture instead of the still: drop the file in public/ and set
 * `video` to its path. The still becomes the poster frame automatically, so the
 * hero still paints immediately and nothing shifts.
 */
export const HERO_MODEL = {
  /**
   * The hero figure. From a 29 MB Sketchfab export down to 0.93 MB: welded,
   * simplified to 28% of its triangles, then Draco geometry and WebP textures.
   *
   * The simplify ratio is the interesting number. It came from measuring, not
   * from taste. At 519k triangles this model cost 1,164 ms of blocked main
   * thread on a cold profile, and roughly half of that was its geometry rather
   * than three.js starting up. At 241k it costs 52 ms. Going further, to 108k,
   * shredded the wires into flat ribbons and punched holes in the face, so this
   * is the floor: the last ratio where the wires still read as wires.
   *
   * `grade` retints it onto the page palette. The model arrives lavender and
   * skin toned, which are two hues this page does not have. At full strength
   * the grade drops each material's colour map, which is where a glTF export
   * keeps its hue, and puts mapped surfaces on the mid-tone metal; unmapped
   * ones ramp by luminance. Normal, roughness, metalness and AO maps stay, so
   * the surface detail survives. See gradeToPalette in ModelStage.
   *
   * `scale` and `lift` push past the measured fit on purpose. The bounding box
   * includes the whole spray of wires, so fitting it makes the head tiny; this
   * frames the head and lets the wires leave the frame.
   */
  model: "/models/robot.glb",
  grade: 1,
  spin: {
    turns: 0.32,
    tilt: 0.12,
    baseY: -0.4,
    baseX: 0.04,
    scale: 1.62,
    lift: 0.14,
  },
} as const;

export const NAV_LINKS = [
  { href: "#twin", label: "Work" },
  { href: "#audits", label: "Audits" },
  { href: "#trajectory", label: "Trajectory" },
  { href: "#research", label: "Research" },
  { href: "#stack", label: "Stack" },
  { href: "#contact", label: "Contact" },
] as const;

/** Shown in Contact. There is no separate availability band on the page. */
export const STATUS = [
  { term: "Availability", value: "Immediate joiner" },
  { term: "Work status", value: "Part time" },
  {
    term: "Right to work",
    value:
      "Student visa. AI and ML internships until January 2027, full time after that on the graduate route.",
  },
] as const;

export interface StackGroup {
  heading: string;
  qualifier: string;
  items: string[];
}

/**
 * Grouped by depth of use, not alphabetically. The bottom group exists so the
 * top group means something.
 */
export const STACK: StackGroup[] = [
  {
    heading: "Shipped and maintained",
    qualifier: "In production, or in a repository with tests around it.",
    items: [
      "Python",
      "SQL",
      "FastAPI",
      "React 19",
      "TypeScript",
      "Databricks",
      "ChromaDB",
      "RAG retrieval",
      "Azure OpenAI",
      "pandas",
      "NumPy",
      "pytest",
      "Git and GitHub",
      "Vercel",
      "Railway",
    ],
  },
  {
    heading: "Used on project work",
    qualifier:
      "Coursework, dissertations, reporting that other people relied on.",
    items: [
      "PyTorch",
      "TensorFlow",
      "Keras",
      "scikit-learn",
      "LangChain",
      "MCP",
      "Azure",
      "AWS",
      "SQL Server",
      "MySQL",
      "MongoDB",
      "statsmodels",
      "Matplotlib",
      "Seaborn",
      "Plotly",
      "Power BI",
      "Streamlit",
      "Excel with VBA",
    ],
  },
  {
    heading: "Read the docs, would need a week",
    qualifier: "Honest about it rather than padding the list above.",
    items: ["R", "Neo4j", "Tableau"],
  },
];

/**
 * Real questions the twin handles. The first two come from its recruiter mode,
 * the last two from interview mode.
 */
export const TWIN_QUESTIONS = [
  "Summarise Vishal as a candidate in 60 seconds",
  "Will he need visa sponsorship?",
  "How do you handle prompt injection?",
  "What chunking strategy did you use and why?",
] as const;

export interface OtherProject {
  title: string;
  meta: string;
  href: string;
}

export const OTHER_PROJECTS: OtherProject[] = [
  {
    title: "CIFAR-10 image classification",
    meta: "TensorFlow, Keras",
    href: "https://github.com/DataScienceVishal/CIFAR-10-CNN",
  },
  {
    title: "Telecom churn prediction",
    meta: "Python, SQL, scikit-learn",
    href: "https://github.com/DataScienceVishal/Telecom_Churn",
  },
];
