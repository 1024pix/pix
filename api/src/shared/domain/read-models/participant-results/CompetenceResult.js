class CompetenceResult {
  constructor({
    competence,
    area,
    totalSkillsCount,
    knowledgeElements,
    flashPixScore,
    reachedStage,
    masteryPercentage,
  }) {
    const validatedSkillsCount = knowledgeElements.filter(({ isValidated }) => isValidated).length;

    this.id = competence.id;

    this.areaColor = area.color;
    this.areaName = area.name;
    this.areaTitle = area.title;
    this.description = competence.description;
    this.flashPixScore = flashPixScore;
    this.index = competence.index;
    this.masteryPercentage = masteryPercentage || Math.round((validatedSkillsCount / totalSkillsCount) * 100);
    this.name = competence.name;
    this.reachedStage = reachedStage;
    this.testedSkillsCount = knowledgeElements.length;
    this.totalSkillsCount = totalSkillsCount;
    this.validatedSkillsCount = validatedSkillsCount;
  }
}

export { CompetenceResult };
