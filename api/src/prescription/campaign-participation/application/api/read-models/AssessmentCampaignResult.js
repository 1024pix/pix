export class TubeResultLevels {
  constructor({ id, competenceId, competenceName, title, description, maxLevel, meanLevel }) {
    this.id = id;
    this.competenceId = competenceId;
    this.competenceName = competenceName;
    this.title = title;
    this.description = description;
    this.maxLevel = maxLevel;
    this.meanLevel = meanLevel;
  }
}

export class CompetenceResultLevels {
  constructor({ id, index, name, description, maxLevel, meanLevel, levelsPerTube = [] }) {
    this.id = id;
    this.index = index;
    this.name = name;
    this.description = description;
    this.maxLevel = maxLevel;
    this.meanLevel = meanLevel;
    this.levelsPerTube = levelsPerTube.map((tube) => new TubeResultLevels(tube));
  }
}

export class AssessmentCampaignResult {
  constructor({ id, masteryRate, maxReachableLevel, meanReachedLevel, levelsPerCompetence = [], levelsPerTube = [] }) {
    this.id = id;
    this.masteryRate = masteryRate;
    this.maxReachableLevel = maxReachableLevel;
    this.meanReachedLevel = meanReachedLevel;
    this.levelsPerCompetence = levelsPerCompetence.map(
      (competence) =>
        new CompetenceResultLevels({
          ...competence,
          levelsPerTube: levelsPerTube.filter((tube) => tube.competenceId === competence.id),
        }),
    );
  }
}
