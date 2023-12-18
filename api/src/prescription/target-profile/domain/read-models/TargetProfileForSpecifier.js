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
    isSimplifiedAccess,
    isPublic,
  }) {
    this.id = id;
    this.name = name;
    this.tubeCount = tubeCount;
    this.thematicResultCount = thematicResultCount;
    this.hasStage = hasStage;
    this.description = description;
    this.category = category;
    this.areKnowledgeElementsResettable = areKnowledgeElementsResettable;
    this.isSimplifiedAccess = isSimplifiedAccess;
    this.isPublic = isPublic;
  }
}

export { TargetProfileForSpecifier };
