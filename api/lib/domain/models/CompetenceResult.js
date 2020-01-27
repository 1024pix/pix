class CompetenceResult {
  constructor({
    id,
    // attributes
    name,
    index,
    areaColor,
    totalSkillsCount,
    testedSkillsCount,
    validatedSkillsCount,
  } = {}) {
    this.id = id;
    // attributes
    this.name = name;
    this.index = index;
    this.areaColor = areaColor;
    this.totalSkillsCount = totalSkillsCount;
    this.testedSkillsCount = testedSkillsCount;
    this.validatedSkillsCount = validatedSkillsCount;
  }
}

module.exports = CompetenceResult;
