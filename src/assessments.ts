import data from "./data/assessments.json";
export type Assessment = {
  model: string;
  classifiedAt: string;
  sourceBased: boolean;
  properties: Record<string, { value: string; confidence: number }>;
  fits: Record<
    string,
    { score: number; confidence: number; probabilities: Record<string, number> }
  >;
  qualities: Record<string, { value: boolean; probability: number }>;
  uncertain: string[];
  evidence: { path: string; sha256: string; originalUrl: string }[];
};
export const assessments = data.entries as Record<string, Assessment>;
