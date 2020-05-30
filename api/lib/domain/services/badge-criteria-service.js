const _ = require('lodash');
const BadgeCriterion = require('../../../lib/domain/models/BadgeCriterion');

function areBadgeCriteriaFulfilled({ campaignParticipationResult, badge }) {
  return _.every(badge.badgeCriteria, (criterion) => {
    let isBadgeCriterionFulfilled;
    let badgePartnerCompetenceResults;

    switch (criterion.scope) {
      case BadgeCriterion.SCOPES.CAMPAIGN_PARTICIPATION :
        isBadgeCriterionFulfilled = _verifyCampaignParticipationResultMasteryPercentageCriterion(
          campaignParticipationResult,
          criterion.threshold
        );
        break;
      case BadgeCriterion.SCOPES.EVERY_PARTNER_COMPETENCE :
        badgePartnerCompetenceResults = campaignParticipationResult.partnerCompetenceResults
          .filter((partnerCompetenceResult) => partnerCompetenceResult.badgeId === badge.id);
        isBadgeCriterionFulfilled = _verifyEveryPartnerCompetenceResultMasteryPercentageCriterion(
          badgePartnerCompetenceResults,
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
