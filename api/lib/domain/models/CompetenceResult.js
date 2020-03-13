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

  get masteryPercentage() {
    if (this.totalSkillsCount !== 0) {
      return Math.round(this.validatedSkillsCount * 100 / this.totalSkillsCount);
    } else {
      return 0;
    }
  }
}

module.exports = CompetenceResult;
