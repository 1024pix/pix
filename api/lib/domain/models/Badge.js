const _ = require('lodash');

class Badge {
  static _CAMPAIGN_PARTICIPATION_RESULT_THRESHOLD = 85;
  static _BADGE_PARTNER_COMPETENCE_RESULT_THRESHOLD = 75;
  _isAquired = false;
  _userId = null;
  badgePartnerCompetences = [];

  constructor({ id, badgePartnerCompetences }) {
    this.id = id;
    this.badgePartnerCompetences = badgePartnerCompetences;
  }

  acquire(userId, campaignParticipationResult) {
    const criteriaFulfilled = this._checkBagdeCriteria(campaignParticipationResult);
    if (criteriaFulfilled === true) {
      this._isAquired = true;
      this._userId = userId;
    }
  }

  isAcquired() {
    return this._isAquired;
  }

  _checkBagdeCriteria(campaignParticipationResult) {
    return this._verifyCampaignParticipationResultMasteryPercentageCriterion(campaignParticipationResult)
      && this._verifyEveryCompetenceResultMasteryPercentageCriterion(campaignParticipationResult.partnerCompetenceResults);
  }

  _verifyCampaignParticipationResultMasteryPercentageCriterion(campaignParticipationResult) {
    return campaignParticipationResult.masteryPercentage >= Badge._CAMPAIGN_PARTICIPATION_RESULT_THRESHOLD;
  }

  _verifyEveryCompetenceResultMasteryPercentageCriterion(partnerCompetenceResults) {
    return _.every(partnerCompetenceResults, (partnerCompetenceResult) =>
      partnerCompetenceResult.masteryPercentage >= Badge._BADGE_PARTNER_COMPETENCE_RESULT_THRESHOLD);
  }
}

module.exports = Badge;
