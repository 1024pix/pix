export class CampaignListItem {
  /**
   * @typedef {object} CampaignListItemArgs
   * @property {number} id
   * @property {string} name
   * @property {Date} createdAt
   * @property {Date} archivedAt
   * @property {string} type
   * @property {string} code
   * @property {string} targetProfileName
   * @property {Array<CampaignTubeCoverage>} tubes
   */

  /**
   * @param {CampaignListItemArgs} args
   */
  constructor({ id, name, createdAt, archivedAt, type, code, targetProfileName, tubes }) {
    this.id = id;
    this.name = name;
    this.createdAt = createdAt;
    this.archivedAt = archivedAt;
    this.type = type;
    this.code = code;
    this.targetProfileName = targetProfileName;
    this.tubes = tubes;

    if (tubes) {
      this.tubes = tubes.map(({ id, competenceId, title, description, reachedLevel, maxLevel }) => {
        return new CampaignTubeCoverage({
          id,
          competenceId,
          title,
          practicalDescription: description,
          practicalTitle: title,
          meanLevel: reachedLevel,
          maxLevel,
        });
      });
    }
  }
}

class CampaignTubeCoverage {
  /**
   * @typedef CampaignTubeCoverageArgs
   * @type {object}
   * @property {string} id
   * @property {string} competenceId
   * @property {string} practicalTitle
   * @property {string} practicalDescription
   * @property {number} maxLevel
   * @property {number} reachedLevel
   */

  /**
   * @param {CampaignTubeCoverageArgs} args
   */

  constructor({ id, competenceId, practicalTitle, practicalDescription, maxLevel, meanLevel }) {
    this.id = id;
    this.competenceId = competenceId;
    this.practicalTitle = practicalTitle;
    this.practicalDescription = practicalDescription;
    this.maxLevel = maxLevel;
    this.meanLevel = meanLevel;
  }
}
