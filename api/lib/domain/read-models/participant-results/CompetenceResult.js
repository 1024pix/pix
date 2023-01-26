class CompetenceResult {
  constructor({ competence, area, totalSkillsCount, knowledgeElements }) {
    const validatedSkillsCount = knowledgeElements.filter(({ isValidated }) => isValidated).length;

    this.id = competence.id;
    this.name = competence.name;
    this.index = competence.index;
    this.areaName = area.name;
    this.areaColor = area.color;
    this.totalSkillsCount = totalSkillsCount;
    this.testedSkillsCount = knowledgeElements.length;
    this.validatedSkillsCount = validatedSkillsCount;
    this.masteryPercentage = Math.round((validatedSkillsCount / totalSkillsCount) * 100);
  }
}

module.exports = CompetenceResult;
