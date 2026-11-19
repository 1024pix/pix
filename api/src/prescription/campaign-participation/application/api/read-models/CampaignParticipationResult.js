class TubeResultLevel {
  /**
   * @param {Object} props
   * @param {string} props.id
   * @param {string} props.competenceId id of the competence the tube belongs to
   * @param {string} props.competenceName
   * @param {string} props.title
   * @param {string} props.description
   * @param {number} props.maxLevel maximum level reachable on the tube
   * @param {number} props.meanLevel level reached by the participant on the tube, exposed as `level`
   */
  constructor({ id, competenceId, competenceName, title, description, maxLevel, meanLevel }) {
    this.id = id;
    this.competenceId = competenceId;
    this.competenceName = competenceName;
    this.title = title;
    this.description = description;
    this.maxLevel = maxLevel;
    this.level = meanLevel;
  }
}

class CompetenceResultLevels {
  /**
   * @param {Object} props
   * @param {string} props.id
   * @param {string} props.index
   * @param {string} props.name
   * @param {string} props.description
   * @param {number} props.maxLevel maximum level reachable on the competence
   * @param {number} props.meanLevel level reached by the participant on the competence
   * @param {Array<Object>} [props.levelsPerTube] results of the tubes belonging to the competence
   */
  constructor({ id, index, name, description, maxLevel, meanLevel, levelsPerTube = [] }) {
    this.id = id;
    this.index = index;
    this.name = name;
    this.description = description;
    this.maxLevel = maxLevel;
    this.meanLevel = meanLevel;
    this.levelsPerTube = levelsPerTube.map((tube) => new TubeResultLevel(tube));
  }
}

export class CampaignParticipationResult {
  /**
   * @param {Object} props
   * @param {number} props.id id of the campaign participation
   * @param {number|null} [props.masteryRate] mastery rate of the participation, between 0 and 1, for an assessment participation
   * @param {number|null} [props.pixScore] pix score of the participant, for a profile collection participation
   * @param {number} props.maxReachableLevel mean of the maximum levels reachable across all tubes
   * @param {number} props.meanReachedLevel mean of the levels reached across all tubes
   * @param {Array<Object>} [props.levelsPerCompetence] results by competence, each one gets the tubes it contains
   * @param {Array<Object>} [props.levelsPerTube] results by tube, dispatched to their competence through `competenceId`
   */
  constructor({
    id,
    masteryRate,
    pixScore,
    maxReachableLevel,
    meanReachedLevel,
    levelsPerCompetence = [],
    levelsPerTube = [],
  }) {
    this.id = id;
    this.masteryRate = masteryRate;
    this.pixScore = pixScore;
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
