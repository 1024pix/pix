const _ = require('lodash');

const CLEA_CAMPAIGN_PARTICIPATION_RESULT_THRESHOLD = 85;
const CLEA_COMPETENCE_RESULT_THRESHOLD = 75;

function areBadgeCriteriaFulfilled({ campaignParticipationResult }) {
  return _verifyCampaignParticipationResultMasteryPercentageCriterion(campaignParticipationResult)
    && _verifyEveryCompetenceResultMasteryPercentageCriterion(campaignParticipationResult.competenceResults);
}

function _verifyCampaignParticipationResultMasteryPercentageCriterion(campaignParticipationResult) {
  return campaignParticipationResult.masteryPercentage >= CLEA_CAMPAIGN_PARTICIPATION_RESULT_THRESHOLD;
}

function _verifyEveryCompetenceResultMasteryPercentageCriterion(competenceResults) {
  return _.every(competenceResults, (competenceResult) => competenceResult.masteryPercentage >= CLEA_COMPETENCE_RESULT_THRESHOLD);
}

module.exports = {
  areBadgeCriteriaFulfilled,
};
