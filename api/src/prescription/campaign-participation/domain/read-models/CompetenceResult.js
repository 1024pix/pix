class CompetenceResult {
  constructor({
    competence,
    area,
    totalSkillsCount,
    testedSkillsCount,
    validatedSkillsCount,
    reachedStage,
    masteryPercentage,
  }) {
    this.id = competence.id;

    this.areaColor = area.color;
    this.areaName = area.name;
    this.areaTitle = area.title;
    this.description = competence.description;
    this.index = competence.index;
    this.masteryPercentage = masteryPercentage || Math.round((validatedSkillsCount / totalSkillsCount) * 100);
    this.name = competence.name;
    this.reachedStage = reachedStage;
    this.testedSkillsCount = testedSkillsCount;
    this.totalSkillsCount = totalSkillsCount;
    this.validatedSkillsCount = validatedSkillsCount;
  }
}

export { CompetenceResult };
