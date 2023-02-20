class SkillSetResult {
  constructor(competence, knowledgeElements) {
    const totalSkillsCount = competence.skillIds.length;
    const validatedSkillsCount = knowledgeElements.filter(({ isValidated }) => isValidated).length;

    this.id = competence.id;
    this.name = competence.name;
    this.totalSkillsCount = totalSkillsCount;
    this.testedSkillsCount = knowledgeElements.length;
    this.validatedSkillsCount = validatedSkillsCount;
    this.masteryPercentage = Math.round((validatedSkillsCount / totalSkillsCount) * 100);
  }
}

export default SkillSetResult;
