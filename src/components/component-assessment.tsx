import { Badge, Disclosure } from "./host-ui";
import { assessments } from "../assessments";
import { traits, useCases, fitLabel } from "../lib/component-assessment.mjs";
const dimensions = traits as Record<
  string,
  { label: string; options: Record<string, string> }
>;
export function AssessmentDetails({ id }: { id: string }) {
  const assessment = assessments[id];
  if (!assessment) return null;
  const matches = Object.entries(assessment.fits)
    .filter(([, fit]) => fit.score >= 0.5)
    .sort((a, b) => b[1].score - a[1].score);
  return (
    <section className="assessment-details" aria-labelledby="assessment-title">
      <h2 id="assessment-title">Is this a good fit?</h2>
      <p>
        Jev’s assessment of the original source. Visual character and setup
        effort are estimates; accessibility and performance are not certified.
      </p>
      <dl className="assessment-traits">
        {Object.entries(dimensions).map(([key, dimension]) => (
          <div key={key}>
            <dt>{dimension.label}</dt>
            <dd>
              {dimension.options[assessment.properties[key]?.value] ||
                "Not clear from the source"}
            </dd>
          </div>
        ))}
      </dl>
      {assessment.qualities.content_flexible?.value && (
        <p className="assessment-quality">
          Accepts custom content through props or children.
        </p>
      )}
      {assessment.qualities.decorative?.value && (
        <p className="assessment-quality">
          Primarily decorative: useful for atmosphere rather than a task flow.
        </p>
      )}
      {matches.length > 0 && (
        <>
          <h3>Useful for</h3>
          <ul className="fit-list">
            {matches.map(([key]) => (
              <li key={key}>
                <span>{useCases[key as keyof typeof useCases]}</span>
                <strong>{fitLabel(assessment, key)}</strong>
              </li>
            ))}
          </ul>
        </>
      )}
      <Disclosure className="assessment-evidence" title="How this was assessed">
        <p>
          {assessment.model} evaluated the supplied source on{" "}
          {new Date(assessment.classifiedAt).toLocaleDateString()}. Uncertain
          judgments are withheld. Confidence describes the model’s certainty,
          not a measured success rate.
        </p>
        <ul>
          {Object.entries(assessment.properties).map(([key, property]) => (
            <li key={key}>
              {dimensions[key]?.label}:{" "}
              {dimensions[key]?.options[property.value]} ·{" "}
              {Math.round(property.confidence * 100)}% model confidence
            </li>
          ))}
        </ul>
        <p>Source evidence</p>
        <ul>
          {assessment.evidence.map((e) => (
            <li key={e.path}>
              <a href={e.originalUrl} target="_blank" rel="noreferrer">
                {e.path.split("/").slice(-2).join("/")}
              </a>
            </li>
          ))}
        </ul>
      </Disclosure>
    </section>
  );
}
export function AssessmentTags({
  id,
  useCase = "",
}: {
  id: string;
  useCase?: string;
}) {
  const assessment = assessments[id];
  if (!assessment) return null;
  const fit = useCase ? fitLabel(assessment, useCase) : null;
  const tags = ["style", "motion", "setup"]
    .flatMap((key) => {
      const p = assessment.properties[key];
      return p ? [dimensions[key].options[p.value]] : [];
    })
    .slice(0, 2);
  return (
    <div className="assessment-tags" aria-label="Jev source assessment">
      {fit && <Badge className="fit-tag">{fit}</Badge>}
      {tags.map((tag) => (
        <Badge key={tag}>{tag}</Badge>
      ))}
    </div>
  );
}
