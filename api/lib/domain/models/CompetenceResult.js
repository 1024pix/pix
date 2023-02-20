class CompetenceResult {
  constructor({
    id,
    name,
    index,
    areaColor,
    areaName,
    totalSkillsCount,
    testedSkillsCount,
    validatedSkillsCount,
  } = {}) {
    this.id = id;
    this.name = name;
    this.index = index;
    this.areaColor = areaColor;
    this.areaName = areaName;
    this.totalSkillsCount = totalSkillsCount;
    this.testedSkillsCount = testedSkillsCount;
    this.validatedSkillsCount = validatedSkillsCount;
  }

  get masteryPercentage() {
    if (this.totalSkillsCount !== 0) {
      return Math.round((this.validatedSkillsCount * 100) / this.totalSkillsCount);
    } else {
      return 0;
    }
  }
}

export default CompetenceResult;
