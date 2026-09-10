export class CombinedCourseBlueprintForUpdate {
  constructor({
    name,
    internalName,
    description,
    prescriberDescription,
    illustration = null,
    surveyLink = null,
    rewardRequirementsDescription = null,
  }) {
    this.name = name;
    this.internalName = internalName;
    this.description = description;
    this.prescriberDescription = prescriberDescription;
    this.illustration = illustration;
    this.surveyLink = surveyLink;
    this.rewardRequirementsDescription = rewardRequirementsDescription;
  }
}
