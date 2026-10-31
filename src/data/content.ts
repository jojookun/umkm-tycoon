import scenariosJson from "./scenarios.json";
import assessmentJson from "./assessment.json";
import glossaryJson from "./glossary.json";
import {
  scenariosSchema,
  assessmentSchema,
  glossarySchema,
} from "../engine/validation";

export const scenarios = scenariosSchema.parse(scenariosJson);
export const assessment = assessmentSchema.parse(assessmentJson);
export const glossary = glossarySchema.parse(glossaryJson);
if (
  [assessment.contentVersion, glossary.contentVersion].some(
    (v) => v !== scenarios.contentVersion,
  )
) {
  throw new Error("Versi konten tidak cocok. Muat ulang aplikasi.");
}
export const config = scenarios.config;
