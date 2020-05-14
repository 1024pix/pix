const _ = require('lodash');
const BadgeCriterion = require('../../../lib/domain/models/BadgeCriterion');

function areBadgeCriteriaFulfilled({ campaignParticipationResult, badgeCriteria }) {
  return _.every(badgeCriteria, (criterion) => {
    let isBadgeCriterionFulfilled;

    switch (criterion.scope) {
      case BadgeCriterion.SCOPES.CAMPAIGN_PARTICIPATION :
        isBadgeCriterionFulfilled = _verifyCampaignParticipationResultMasteryPercentageCriterion(
          campaignParticipationResult,
          criterion.threshold
        );
        break;
      case BadgeCriterion.SCOPES.EVERY_PARTNER_COMPETENCE :
        isBadgeCriterionFulfilled = _verifyEveryPartnerCompetenceResultMasteryPercentageCriterion(
          campaignParticipationResult.partnerCompetenceResults,
          criterion.threshold
        );
        break;
      default:
        isBadgeCriterionFulfilled = false;
        break;
    }

    return isBadgeCriterionFulfilled;
  });
}

function _verifyCampaignParticipationResultMasteryPercentageCriterion(campaignParticipationResult, threshold) {
  return campaignParticipationResult.masteryPercentage >= threshold;
}

function _verifyEveryPartnerCompetenceResultMasteryPercentageCriterion(partnerCompetenceResults, threshold) {
  return _.every(partnerCompetenceResults, (partnerCompetenceResult) =>
    partnerCompetenceResult.masteryPercentage >= threshold);
}

module.exports = {
  areBadgeCriteriaFulfilled,
};
