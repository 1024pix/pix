const _ = require('lodash');
const BadgeCriterion = require('../../../lib/domain/models/BadgeCriterion');

function areBadgeCriteriaFulfilled({ campaignParticipationResult, badge }) {
  return _.every(badge.badgeCriteria, (criterion) => {
    let isBadgeCriterionFulfilled = false;
    let campaignParticipationBadge;

    switch (criterion.scope) {
      case BadgeCriterion.SCOPES.CAMPAIGN_PARTICIPATION:
        isBadgeCriterionFulfilled = _verifyCampaignParticipationResultMasteryPercentageCriterion(
          campaignParticipationResult,
          criterion.threshold,
        );
        break;

      case BadgeCriterion.SCOPES.EVERY_PARTNER_COMPETENCE:
        campaignParticipationBadge = _.find(
          campaignParticipationResult.campaignParticipationBadges,
          (campaignParticipationBadge) => campaignParticipationBadge.id === badge.id,
        );
        if (campaignParticipationBadge) {
          isBadgeCriterionFulfilled = _verifyEveryPartnerCompetenceResultMasteryPercentageCriterion(
            campaignParticipationBadge.partnerCompetenceResults,
            criterion.threshold,
          );
        }
        break;

      case BadgeCriterion.SCOPES.SOME_PARTNER_COMPETENCES:
        campaignParticipationBadge = _.find(
          campaignParticipationResult.campaignParticipationBadges,
          (campaignParticipationBadge) => campaignParticipationBadge.id === badge.id,
        );
        if (campaignParticipationBadge && criterion.partnerCompetenceIds) {
          isBadgeCriterionFulfilled = _verifySomePartnerCompetenceResultsMasteryPercentageCriterion(
            campaignParticipationBadge.partnerCompetenceResults,
            criterion.threshold,
            criterion.partnerCompetenceIds,
          );
        }
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

function _verifySomePartnerCompetenceResultsMasteryPercentageCriterion(partnerCompetenceResults, threshold, criterionPartnerCompetenceIds) {
  const filteredPartnerCompetenceResults = _.filter(partnerCompetenceResults, (partnerCompetenceResult) => {
    return criterionPartnerCompetenceIds.includes(partnerCompetenceResult.id);
  });

  return _.every(filteredPartnerCompetenceResults, (partnerCompetenceResult) =>
    partnerCompetenceResult.masteryPercentage >= threshold);
}

module.exports = {
  areBadgeCriteriaFulfilled,
};
