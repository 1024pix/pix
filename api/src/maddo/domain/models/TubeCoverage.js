export class TubeCoverage {
  constructor({
    id,
    competenceId,
    competenceName,
    competenceIndex,
    areaName,
    maxLevel,
    reachedLevel,
    practicalDescription,
    practicalTitle,
  }) {
    this.id = id;
    this.competenceId = competenceId;
    this.competenceName = competenceName;
    this.competenceIndex = competenceIndex;
    this.areaName = areaName;
    this.maxLevel = maxLevel;
    this.reachedLevel = reachedLevel;
    this.practicalDescription = practicalDescription;
    this.practicalTitle = practicalTitle;
  }
}
