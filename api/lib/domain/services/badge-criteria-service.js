const _ = require('lodash');

const CAMPAIGN_PARTICIPATION_RESULT_THRESHOLD = 85;
const BADGE_PARTNER_COMPETENCE_RESULT_THRESHOLD = 75;

function areBadgeCriteriaFulfilled({ campaignParticipationResult }) {
  return _verifyCampaignParticipationResultMasteryPercentageCriterion(campaignParticipationResult)
    && _verifyEveryCompetenceResultMasteryPercentageCriterion(campaignParticipationResult.partnerCompetenceResults);
}

function _verifyCampaignParticipationResultMasteryPercentageCriterion(campaignParticipationResult) {
  return campaignParticipationResult.masteryPercentage >= CAMPAIGN_PARTICIPATION_RESULT_THRESHOLD;
}

function _verifyEveryCompetenceResultMasteryPercentageCriterion(partnerCompetenceResults) {
  return _.every(partnerCompetenceResults, (partnerCompetenceResult) =>
    partnerCompetenceResult.masteryPercentage >= BADGE_PARTNER_COMPETENCE_RESULT_THRESHOLD);
}

module.exports = {
  areBadgeCriteriaFulfilled,
};
