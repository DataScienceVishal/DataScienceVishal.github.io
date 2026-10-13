/**
 * Who, how to reach him, and on what terms. Every fact here is from the CV in
 * /public, apart from the Graduate route length, which is GOV.UK's: 18 months
 * for any application made on or after 1 January 2027, and the MSc ends that
 * January.
 */

export const PROFILE = {
  name: "Vishal Khan",
  role: "AI and ML engineer",
  location: "London, United Kingdom",
  email: "vishalkhan251@gmail.com",
  github: "https://github.com/DataScienceVishal",
  githubHandle: "DataScienceVishal",
  linkedin: "https://www.linkedin.com/in/vishalkhandatascience/",
  linkedinHandle: "vishalkhandatascience",
  cv: "/vishal-khan-resume.pdf",
  twin: "https://ai-professional-twin.vercel.app/",
  repo: "https://github.com/DataScienceVishal/DataScienceVishal.github.io",
  /**
   * The day the page's facts were last checked against their sources. Set by
   * hand when the content changes, so it never claims an update that a deploy
   * alone did not make.
   */
  checked: { iso: "2026-10-12", label: "12 Oct 2026" },
} as const;

export const CALL_MAILTO =
  `mailto:${PROFILE.email}` +
  "?subject=" +
  encodeURIComponent("An AI/ML role") +
  "&body=" +
  encodeURIComponent("Hi Vishal,\n\nThe role, and a couple of times that work for a call:\n\n");

/**
 * Written permission first. A UK screener who reads "Student visa" before the
 * clause that answers it has already filed the application under sponsorship.
 */
export const STATUS = [
  {
    term: "Sponsorship",
    value:
      "Not needed for an internship now, or for 18 months of full-time work from early 2027. The Student visa and the Graduate route both carry their own permission to work.",
  },
  {
    term: "Until January 2027",
    value:
      "An AI or ML internship alongside the MSc: twenty hours a week in term time and full time in the vacations. No notice period.",
  },
  {
    term: "From early 2027",
    value:
      "Full time, on the Graduate route, which gives 18 months of work with no sponsor.",
  },
] as const;

/**
 * A draft from facts already on the CV, in the page's first person. It is the
 * one block on the page that Vishal should rewrite in his own words.
 */
export const ABOUT = [
  "I started in finance and tax, filing GST and income tax returns where every figure had to survive someone checking it months later. After that came over two years of sales forecasting and reporting, then a year and a half building Databricks pipelines over telecom records at Teleperformance.",
  "Now I am finishing an MSc in AI and Computer Science at Northeastern University London, and most of what I build asks whether an AI system's numbers can be trusted.",
] as const;

/** The notebook's contents row. Order is page order. */
export const CONTENTS = [
  { href: "#scorer-audit", label: "Scorer audit" },
  { href: "#twicerun", label: "twicerun" },
  { href: "#lesion-split", label: "lesion-split" },
  { href: "#twin", label: "The twin" },
  { href: "#background", label: "Background" },
  { href: "#contact", label: "Contact" },
] as const;
