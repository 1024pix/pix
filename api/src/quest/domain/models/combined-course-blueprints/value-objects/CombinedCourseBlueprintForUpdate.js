export class CombinedCourseBlueprintForUpdate {
  constructor({ name, internalName, description = null, illustration = null, surveyLink = null }) {
    this.name = name;
    this.internalName = internalName;
    this.description = description;
    this.illustration = illustration;
    this.surveyLink = surveyLink;
  }
}
