/**
 * The career, as data. Every date and title is from the resume PDF; the two
 * dissertations and the degree dates are from the education section of it.
 *
 * `band` is the ordinal axis the graph rises through: what he was actually
 * working on, not the job title. That is the part the brief says is interesting.
 */

export const BANDS = [
  { key: "filings", label: "Filings" },
  { key: "reporting", label: "Reporting" },
  { key: "pipelines", label: "Pipelines" },
  { key: "models", label: "Models" },
] as const;

export type BandKey = (typeof BANDS)[number]["key"];

export interface Move {
  /** Decimal year, so a mid-year start lands in the right place. */
  from: number;
  to: number;
  band: BandKey;
  org: string;
  role: string;
  /** The transition, which is the content that matters here. */
  note: string;
  dates: string;
}

/** Jul 2018 is 2018.5, Sep 2020 is 2020.75, and so on. */
export const MOVES: Move[] = [
  {
    from: 2018.5,
    to: 2020.75,
    band: "filings",
    org: "PJRJ Associates",
    role: "Finance, accounts and taxation",
    note: "GST filings, income tax returns, audits. Every figure had to survive somebody checking it months later.",
    dates: "Jul 2018 to Sep 2020",
  },
  {
    from: 2021.0,
    to: 2021.67,
    band: "filings",
    org: "Aryan Care",
    role: "E-commerce and finance executive",
    note: "Still filings, now beside an e-commerce operation. First time the question was what the data meant.",
    dates: "Jan 2021 to Aug 2021",
  },
  {
    from: 2021.67,
    to: 2024.0,
    band: "reporting",
    org: "Avant Garde",
    role: "Executive",
    note: "ML sales forecasting at 80 to 90% accuracy, and a reporting rebuild that cut two hours to thirty minutes.",
    dates: "Aug 2021 to Dec 2023",
  },
  {
    from: 2024.42,
    to: 2026.08,
    band: "pipelines",
    org: "Teleperformance",
    role: "Data Engineer",
    note: "Databricks pipelines over millions of telecom records. A year and a half before I got near a model.",
    dates: "Jun 2024 to Jan 2026",
  },
  {
    from: 2026.08,
    to: 2027.08,
    band: "models",
    org: "Northeastern University London",
    role: "MSc, AI and Computer Science",
    note: "Agent reliability. The dissertation and the twin are the same question approached from two ends.",
    dates: "Jan 2026 to Jan 2027",
  },
];

export interface Study {
  from: number;
  to: number;
  label: string;
  where: string;
}

/** The second track. It overlaps the work, which is the point. */
export const STUDY: Study[] = [
  { from: 2018.83, to: 2021.83, label: "BCom", where: "University of Delhi" },
  {
    from: 2022.0,
    to: 2023.0,
    label: "PG, Data Science",
    where: "IIIT Bangalore",
  },
  { from: 2023.17, to: 2024.17, label: "MSc, Data Science", where: "LJMU" },
  {
    from: 2026.08,
    to: 2027.08,
    label: "MSc, AI and CS",
    where: "Northeastern London",
  },
];

export const SPAN = { start: 2018.3, end: 2027.3 };
