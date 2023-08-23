class TargetProfileForSpecifier {
  constructor({
    id,
    name,
    tubeCount,
    thematicResultCount,
    hasStage,
    description,
    category,
    areKnowledgeElementsResettable,
  }) {
    this.id = id;
    this.name = name;
    this.tubeCount = tubeCount;
    this.thematicResultCount = thematicResultCount;
    this.hasStage = hasStage;
    this.description = description;
    this.category = category;
    this.areKnowledgeElementsResettable = areKnowledgeElementsResettable;
  }
}

export { TargetProfileForSpecifier };
