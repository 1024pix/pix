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
    this.name = competence.name;
    this.index = competence.index;
    this.areaName = area.name;
    this.areaTitle = area.title;
    this.areaColor = area.color;
    this.totalSkillsCount = totalSkillsCount;
    this.testedSkillsCount = knowledgeElements.length;
    this.validatedSkillsCount = validatedSkillsCount;
    this.masteryPercentage = masteryPercentage || Math.round((validatedSkillsCount / totalSkillsCount) * 100);
    this.flashPixScore = flashPixScore;
    this.reachedStage = reachedStage;
  }
}

module.exports = CompetenceResult;
