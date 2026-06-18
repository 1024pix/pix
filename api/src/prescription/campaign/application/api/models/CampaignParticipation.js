export class CampaignParticipation {
  /**
   * @typedef {Object} CampaignParticipationArgs
   * @property {string} participantFirstName
   * @property {string} participantLastName
   * @property {string | null} participantExternalId
   * @property {number} userId
   * @property {number} campaignParticipationId
   * @property {Date} createdAt
   * @property {Date | null} sharedAt
   * @property {string} status
   */

  /**
   * @param {CampaignParticipationArgs} args
   */
  constructor({
    participantFirstName,
    participantLastName,
    participantExternalId = null,
    userId,
    campaignParticipationId,
    createdAt,
    sharedAt,
    status,
  } = {}) {
    this.participantFirstName = participantFirstName;
    this.participantLastName = participantLastName;
    this.participantExternalId = participantExternalId;
    this.userId = userId;
    this.campaignParticipationId = campaignParticipationId;
    this.createdAt = createdAt;
    this.sharedAt = sharedAt;
    this.status = status;
  }

  get id() {
    return this.campaignParticipationId;
  }

  get isShared() {
    return Boolean(this.sharedAt);
  }
}

/**
 * @typedef {object} AssessmentCampaignParticipationArgs
 * @extends CampaignParticipationArgs
 * @property {number} masteryRate
 * @property {Array<TubeCoverage>} tubes
 */

/**
 * @class
 */
export class AssessmentCampaignParticipation extends CampaignParticipation {
  /**
   * @param {AssessmentCampaignParticipationArgs} args
   */
  constructor(args) {
    super(args);
    this.masteryRate = args.masteryRate != null ? Number(args.masteryRate) : null;
    this.tubes = args.tubes?.map((tube) => new TubeCoverage(tube));
    this.stages = args.stages;
    this.badges = args.badges;
  }
}

/**
 * @typedef {object} ProfilesCollectionCampaignParticipationArgs
 * @extends CampaignParticipationArgs
 * @property {number} pixScore
 */

export class ProfilesCollectionCampaignParticipation extends CampaignParticipation {
  /**
   * @param {ProfilesCollectionCampaignParticipationArgs} args
   */
  constructor(args) {
    super(args);
    this.pixScore = args.pixScore;
    this.tubes = args.tubes?.map((tube) => new TubeCoverage(tube));
  }
}

class TubeCoverage {
  /**
   * @typedef {Object} TubeCoverageArgs
   * @property {string} id
   * @property {string} competenceId
   * @property {string} title
   * @property {string} description
   * @property {number} maxLevel
   * @property {number} reachedLevel
   */

  /**
   * @param {TubeCoverageArgs} args
   */

  constructor({ id, competenceId, title, description, maxLevel, reachedLevel }) {
    this.id = id;
    this.competenceId = competenceId;
    this.practicalTitle = title;
    this.practicalDescription = description;
    this.maxLevel = maxLevel;
    this.reachedLevel = reachedLevel;
  }
}
