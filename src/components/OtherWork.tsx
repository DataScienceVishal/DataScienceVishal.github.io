import { ArrowUpRight } from "@phosphor-icons/react";
import { ModelViewport } from "./ModelViewport";
import { CHURN_CUTOFF, CIFAR_ACCURACY, UKHE_MODELS } from "../data/charts";
import { BarChart, LineChart } from "./Chart";
import { Claim } from "./Claim";
import { Section } from "./Section";

interface EntryProps {
  title: string;
  meta: string;
  href: string;
  hrefLabel: string;
  children: React.ReactNode;
  chart: React.ReactNode;
}

function Entry({ title, meta, href, hrefLabel, children, chart }: EntryProps) {
  return (
    <li className="grid gap-x-10 gap-y-6 py-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div>
        <h3 className="t-title">{title}</h3>
        <p className="t-mono-sm mt-1.5 text-graphite">{meta}</p>
        <p className="t-body-sm mt-4 max-w-[54ch] text-read">{children}</p>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="t-mono-sm mt-5 inline-flex items-center gap-1.5 text-graphite transition-[color] duration-[var(--dur-out)] ease-[var(--ease-in)] hover:text-brass hover:duration-[var(--dur-in)] hover:ease-[var(--ease-out)]"
        >
          {hrefLabel}
          <ArrowUpRight size={13} aria-hidden="true" />
          <span className="sr-only">{`, ${title}, opens in a new tab`}</span>
        </a>
      </div>

      <div className="lg:pt-1">{chart}</div>
    </li>
  );
}

export function OtherWork() {
  return (
    <Section
      id="other-work"
      heading="Other work"
      lede="Smaller than the twin and honest about it. The code is public, the numbers below are read straight out of the notebooks and READMEs, and the charts are redrawn from that data rather than screenshotted."
    >
      <ul className="divide-y divide-rule border-y border-rule">
        <Entry
          title="UK higher education completion risk"
          meta="Office for Students data, Python, scikit-learn, XGBoost"
          href="https://github.com/DataScienceVishal/UK-HE-Completion-Risk-Classifier"
          hrefLabel="Repository"
          chart={<BarChart data={UKHE_MODELS} />}
        >
          Predicting which English providers fall in the bottom quartile for
          completion, from{" "}
          <Claim source="ukhe-repo">312 providers and 33 columns</Claim>. Five
          classifiers, five-fold stratified cross-validation on 244 training
          rows. The interesting part is the threshold: missing a struggling
          provider is worse than over-flagging a healthy one, so dropping the
          cutoff from 0.50 to 0.30 takes minority recall from{" "}
          <Claim source="ukhe-repo">0.62 to 0.94</Claim>, catching 15 of 16
          at-risk providers for 18 false positives instead of 12. This one is not
          on the resume; it was published after it.
        </Entry>

        <Entry
          title="Women in chess, twelve queries"
          meta="FIDE ratings, chess.com games, pandas"
          href="https://github.com/DataScienceVishal/Queens-Gambit-Female-Chess-Analytics"
          hrefLabel="Repository"
          chart={
            <ModelViewport
              scene={{
                kind: "gltf",
                url: "/models/chess.glb",
                spin: { turns: 0.85, tilt: 0.22, baseY: -0.5, baseX: 0.16, scale: 1, lift: 0 },
              }}
              height="clamp(15rem, 34vw, 20rem)"
              alt="A chess set rendered in three dimensions, turning as the page scrolls."
              caption="The board turns with the scroll rather than on a loop, so it only moves while you do."
              credit={
                <>
                  Model: A Beautiful Game, Ed Mackey and ASWF, CC BY 4.0, from the
                  Khronos glTF sample assets.
                </>
              }
            />
          }
        >
          <Claim source="chess-repo">
            4.8 million FIDE player-month rows
          </Claim>{" "}
          from February 2015 to November 2024, joined to 304,767 chess.com games
          for twelve tracked players. Twelve queries across titles, federations
          and online activity. Only{" "}
          <Claim source="chess-repo" flip>
            1.4% of female players ever change federation
          </Claim>
          . The age-against-activity hypothesis came out at p around 0.44 with
          n = 12, so it is written up as not significant rather than as a finding.
          Also not on the resume.
        </Entry>

        <Entry
          title="CIFAR-10 image classification"
          meta="TensorFlow, Keras"
          href="https://github.com/DataScienceVishal/CIFAR-10-CNN"
          hrefLabel="Repository"
          chart={<LineChart data={CIFAR_ACCURACY} />}
        >
          A CNN with normalisation, dropout and L2 regularisation, trained for
          five epochs.{" "}
          <Claim source="cifar-repo">
            72.12% training accuracy, 74.06% validation
          </Claim>
          . The curve below is that run, epoch by epoch.
        </Entry>

        <Entry
          title="Telecom churn prediction"
          meta="Python, SQL, scikit-learn"
          href="https://github.com/DataScienceVishal/Telecom_Churn"
          hrefLabel="Repository"
          chart={<LineChart data={CHURN_CUTOFF} />}
        >
          7,032 customers after cleaning, 21 predictors, logistic regression
          against decision tree and random forest.{" "}
          <Claim source="churn-repo" flip>
            About 80% accuracy, with tenure the strongest predictor
          </Claim>
          . Choosing the cutoff mattered more than choosing the model, which is
          what the chart is about.
        </Entry>
      </ul>
    </Section>
  );
}
