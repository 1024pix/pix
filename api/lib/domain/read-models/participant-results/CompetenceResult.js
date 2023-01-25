class CompetenceResult {
  constructor({ competence, knowledgeElements }) {
    const totalSkillsCount = competence.skillIds.length;
    const validatedSkillsCount = knowledgeElements.filter(({ isValidated }) => isValidated).length;

    this.id = competence.id;
    this.name = competence.name;
    this.index = competence.index;
    this.areaName = competence.areaName;
    this.areaColor = competence.areaColor;
    this.totalSkillsCount = totalSkillsCount;
    this.testedSkillsCount = knowledgeElements.length;
    this.validatedSkillsCount = validatedSkillsCount;
    this.masteryPercentage = Math.round((validatedSkillsCount / totalSkillsCount) * 100);
  }
}

module.exports = CompetenceResult;
