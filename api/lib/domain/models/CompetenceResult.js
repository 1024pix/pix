class CompetenceResult {
  constructor({
    id,
    // attributes
    name,
    index,
    totalSkillsCount,
    testedSkillsCount,
    validatedSkillsCount,
  } = {}) {
    this.id = id;
    // attributes
    this.name = name;
    this.index = index;
    this.totalSkillsCount = totalSkillsCount;
    this.testedSkillsCount = testedSkillsCount;
    this.validatedSkillsCount = validatedSkillsCount;
  }
}

module.exports = CompetenceResult;
