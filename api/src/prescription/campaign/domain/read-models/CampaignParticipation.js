class CampaignParticipation {
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
 * @property {Object} tubes
 * @property {{
 *  reachedStage: number
 *  numberOfStages: number
 * }} stages
 * @property {Badge[]} badges
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
    this.tubes = args.tubes;
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
    this.tubes = args.tubes;
    this.pixScore = args.pixScore;
  }
}

export class Badge {
  constructor({ id, key, title, imageUrl, message, altMessage, isAcquired, acquisitionPercentage }) {
    this.id = id;
    this.key = key;
    this.title = title;
    this.imageUrl = imageUrl;
    this.message = message;
    this.altMessage = altMessage;
    this.isAcquired = isAcquired;
    this.acquisitionPercentage = acquisitionPercentage;
  }
}

/**
 * @property {string} id
 * @property {string} competenceId
 * @property {string} competenceName
 * @property {string} title
 * @property {string} description
 * @property {number} maxLevel
 * @property {number} reachedLevel
 *
 */
export class TubeCoverage {
  /**
   * @param {object} args
   * @param {string} args.id
   * @param {string} args.competenceId
   * @param {string} args.competenceName
   * @param {string} args.title
   * @param {string} args.description
   * @param {number} args.maxLevel
   * @param {number} args.reachedLevel
   */
  constructor({ id, competenceId, competenceName, title, description, maxLevel, reachedLevel }) {
    this.id = id;
    this.competenceId = competenceId;
    this.competenceName = competenceName;
    this.title = title;
    this.description = description;
    this.maxLevel = maxLevel;
    this.reachedLevel = reachedLevel;
  }
}
