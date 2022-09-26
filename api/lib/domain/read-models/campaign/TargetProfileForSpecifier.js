class TargetProfileForSpecifier {
  constructor({ id, name, tubeCount, thematicResults, hasStage, description, category }) {
    this.id = id;
    this.name = name;
    this.tubeCount = tubeCount;
    this.thematicResultCount = thematicResults.length;
    this.hasStage = hasStage;
    this.description = description;
    this.category = category;
  }
}

module.exports = TargetProfileForSpecifier;
