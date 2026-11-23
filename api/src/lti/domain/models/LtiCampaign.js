/**
 * @typedef {object} LtiCompetence
 * @property {string} id
 * @property {string} index
 * @property {string} name
 * @property {number} maxLevel
 */

const MASTERY_RATE_SCORE_MAXIMUM = 100;
const PIX_SCORE_MAXIMUM = 1024;

export class LtiCampaign {
  #lineItemResourcePrefix;

  /**
   * @param {Object} props
   * @param {number} props.id
   * @param {string} props.code
   * @param {string} props.name
   * @param {string} props.type
   * @param {string} props.organizationName
   * @param {string} props.organizationId
   * @param {string} props.description
   * @param {Array<LtiCompetence>} [props.competences]
   */
  constructor({ id, code, name, type, organizationName, organizationId, description, competences = [] }) {
    this.id = id;
    this.code = code;
    this.name = name;
    this.type = type;
    this.organizationName = organizationName;
    this.organizationId = organizationId;
    this.description = description;
    this.competences = competences;
    this.#lineItemResourcePrefix = `pix:campaign:${this.id}`;
  }

  /**
   * Builds the content item for deep linking response.
   *
   * @param {{ __: (key: string) => string }} i18n
   */
  buildContentItem(i18n) {
    return {
      type: 'ltiResourceLink',
      title: this.name,
      text: this.description ?? i18n.__('lti.profiles-collection-campaign-description'),
      custom: { campaign_id: String(this.id), campaign_code: this.code },
    };
  }

  /**
   * @param {number[]} organizationIds
   */
  belongsToOneOf(organizationIds) {
    return organizationIds.includes(this.organizationId);
  }

  /** @returns {string} tag shared by every line item of the campaign, used to find them on the platform */
  get lineItemTag() {
    return `pix-campaign-${this.id}`;
  }

  /**
   * Builds the AGS line items expected on the platform for this campaign:
   * one per competence, plus a global one depending on the campaign type.
   *
   * @param { string } resourceLinkId LTI resource link id
   * @param {{ __: (key: string) => string }} i18n
   * @returns {Array<{ label: string, resourceId: string, scoreMaximum: number, tag: string }>}
   */
  buildLineItems(resourceLinkId, i18n) {
    return this.competences
      .map((competence) => ({
        label: `${this.code} : ${competence.index} ${competence.name}`,
        resourceId: this.#competenceResourceId(competence.id),
        scoreMaximum: Math.round(competence.maxLevel),
        tag: this.lineItemTag,
        resourceLinkId,
      }))
      .concat(this.#buildGlobalLineItem(resourceLinkId, i18n))
      .filter(Boolean);
  }

  /**
   * Builds the scores to publish on the line items of the campaign (see `buildLineItems`)
   * from the result of a participation.
   *
   * @param {import('./CampaignParticipationResult.js').CampaignParticipationResult} campaignParticipationResult
   * @returns {Array<{ resourceId: string, scoreGiven: number, scoreMaximum: number }>}
   */
  buildLineItemScores(campaignParticipationResult) {
    const participationCompetenceById = new Map(
      campaignParticipationResult.competences.map((competence) => [competence.id, competence]),
    );
    return this.competences
      .map((competence) => {
        const competenceResult = participationCompetenceById.get(competence.id);
        if (!competenceResult) return null;

        const scoreMaximum = Math.round(competence.maxLevel);
        return {
          resourceId: this.#competenceResourceId(competence.id),
          scoreGiven: Math.min(competenceResult.reachedLevel, scoreMaximum),
          scoreMaximum,
        };
      })
      .concat(this.#buildGlobalLineItemScore(campaignParticipationResult))
      .filter(Boolean);
  }

  #competenceResourceId(competenceId) {
    return `${this.#lineItemResourcePrefix}:competence:${competenceId}`;
  }

  get #masteryRateResourceId() {
    return `${this.#lineItemResourcePrefix}:mastery-rate`;
  }

  get #pixScoreResourceId() {
    return `${this.#lineItemResourcePrefix}:pix-score`;
  }

  #buildGlobalLineItemScore({ masteryRate, pixScore }) {
    switch (this.type) {
      case 'ASSESSMENT':
      case 'EXAM':
        if (masteryRate === null) return null;
        return {
          resourceId: this.#masteryRateResourceId,
          scoreGiven: Math.round(masteryRate * MASTERY_RATE_SCORE_MAXIMUM),
          scoreMaximum: MASTERY_RATE_SCORE_MAXIMUM,
        };
      case 'PROFILES_COLLECTION':
        if (pixScore === null) return null;
        return {
          resourceId: this.#pixScoreResourceId,
          scoreGiven: pixScore,
          scoreMaximum: PIX_SCORE_MAXIMUM,
        };
      default:
        return null;
    }
  }

  #buildGlobalLineItem(resourceLinkId, i18n) {
    switch (this.type) {
      case 'ASSESSMENT':
      case 'EXAM':
        return {
          label: `${this.code} : ${i18n.__('lti.line-item-mastery-rate')}`,
          resourceId: this.#masteryRateResourceId,
          scoreMaximum: MASTERY_RATE_SCORE_MAXIMUM,
          tag: this.lineItemTag,
          resourceLinkId,
        };
      case 'PROFILES_COLLECTION':
        return {
          label: `${this.code} : ${i18n.__('lti.line-item-pix-score')}`,
          resourceId: this.#pixScoreResourceId,
          scoreMaximum: PIX_SCORE_MAXIMUM,
          tag: this.lineItemTag,
          resourceLinkId,
        };
      default:
        return null;
    }
  }
}
