/**
 * Roles and study, once. The Background page lists them and the route figure
 * draws them from the same records, so a date cannot be right in one and
 * wrong in the other. Everything is from the CV.
 *
 * `from` and `to` are decimal years: July 2018 is 2018.5, and an end month is
 * counted to its last day, so September 2020 ends at 2020.75.
 */

export const BANDS = ["Filings", "Reporting", "Pipelines", "Models"] as const;
export type Band = (typeof BANDS)[number];

export interface Role {
  org: string;
  role: string;
  dates: string;
  from: number;
  to: number;
  /** What the work was, rather than what the job was called. */
  band: Band;
  outcome: string;
}

/** Most recent first, the order a CV is read in. */
export const ROLES: Role[] = [
  {
    org: "Teleperformance Global Business",
    role: "Data Engineer",
    dates: "Jun 2024 to Jan 2026",
    from: 2024.42,
    to: 2026.08,
    band: "Pipelines",
    outcome:
      "Databricks pipelines over millions of telecom records, feeding a data engineering team of 50 or more. Migrated on-prem SQL Server schemas to Databricks, with query performance up by about 20% and infrastructure cost down by about 20%.",
  },
  {
    org: "Avant Garde Clean Room and Engg. Solutions",
    role: "Executive",
    dates: "Aug 2021 to Dec 2023",
    from: 2021.58,
    to: 2024.0,
    band: "Reporting",
    outcome:
      "ML sales forecasts reaching 80 to 90% accuracy on monthly revenue, used daily for planning. Rebuilt revenue and collections reporting in Excel and VBA, from about two hours a month to about thirty minutes.",
  },
  {
    org: "Aryan Care",
    role: "E-commerce and finance executive",
    dates: "Jan 2021 to Aug 2021",
    from: 2021.0,
    to: 2021.67,
    band: "Filings",
    outcome: "GST and income tax filings and audits, beside an e-commerce operation.",
  },
  {
    org: "PJRJ Associates",
    role: "Finance, accounts and taxation",
    dates: "Jul 2018 to Sep 2020",
    from: 2018.5,
    to: 2020.75,
    band: "Filings",
    outcome: "Two years of finance and taxation work: GST filings, income tax returns and audits.",
  },
];

export interface Study {
  degree: string;
  where: string;
  dates: string;
  from: number;
  to: number;
  note?: string;
}

export const STUDY: Study[] = [
  {
    degree: "MSc, AI and Computer Science",
    where: "Northeastern University London",
    dates: "Jan 2026 to Jan 2027",
    from: 2026.0,
    to: 2027.08,
    note: "Dissertation in progress, on agent reliability. Nothing to read yet.",
  },
  {
    degree: "MSc, Data Science",
    where: "Liverpool John Moores University",
    dates: "Mar 2023 to Mar 2024",
    from: 2023.17,
    to: 2024.25,
    note: "Dissertation on reinforcement learning for dynamic pricing: DQN, A2C and PPO in a Gym-style environment built on real e-commerce data, where DQN gave the most stable profit curve. It is not published online, so that result cannot be checked from here. I will send the document on request.",
  },
  {
    degree: "Executive PG Programme, Data Science",
    where: "IIIT Bangalore",
    dates: "Jan 2022 to Jan 2023",
    from: 2022.0,
    to: 2023.08,
  },
  {
    degree: "Bachelor of Commerce",
    where: "University of Delhi",
    dates: "Nov 2018 to Nov 2021",
    from: 2018.83,
    to: 2021.92,
  },
];

export const SPAN = { start: 2018.25, end: 2027.25 } as const;
