type CombinedCourseBlueprintForUpdateArgs = {
  name: string;
  internalName: string;
  description: string;
  prescriberDescription: string;
  illustration?: string | null;
  durationSpan?: string | null;
  surveyLink?: string | null;
  rewardRequirementsDescription?: string | null;
};

export class CombinedCourseBlueprintForUpdate {
  name: string;
  internalName: string;
  description: string;
  prescriberDescription: string;
  illustration: string | null;
  durationSpan: string | null;
  surveyLink: string | null;
  rewardRequirementsDescription: string | null;

  constructor({
    name,
    internalName,
    description,
    prescriberDescription,
    illustration = null,
    durationSpan = null,
    surveyLink = null,
    rewardRequirementsDescription = null,
  }: CombinedCourseBlueprintForUpdateArgs) {
    this.name = name;
    this.internalName = internalName;
    this.description = description;
    this.prescriberDescription = prescriberDescription;
    this.illustration = illustration;
    this.durationSpan = durationSpan;
    this.surveyLink = surveyLink;
    this.rewardRequirementsDescription = rewardRequirementsDescription;
  }
}
