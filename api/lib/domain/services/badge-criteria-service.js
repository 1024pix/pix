const _ = require('lodash');

const CAMPAIGN_PARTICIPATION_RESULT_MASTERY_PERCENTAGE = 'La campagne est maîtrisée à X %';
const EVERY_COMPETENCE_RESULT_MASTERY_PERCENTAGE = 'Chaque compétence de la campagne est maîtrisée à X %';

function areBadgeCriteriaFulfilled({ campaignParticipationResult, badgeCriteria }) {
  return _.every(badgeCriteria, (badgeCriterion) => {
    let isBadgeCriterionFulfilled;

    switch (badgeCriterion.scope) {
      case CAMPAIGN_PARTICIPATION_RESULT_MASTERY_PERCENTAGE :
        isBadgeCriterionFulfilled = _verifyCampaignParticipationResultMasteryPercentageCriterion(
          campaignParticipationResult,
          badgeCriterion.threshold
        );
        break;
      case EVERY_COMPETENCE_RESULT_MASTERY_PERCENTAGE :
        isBadgeCriterionFulfilled = _verifyEveryCompetenceResultMasteryPercentageCriterion(
          campaignParticipationResult.partnerCompetenceResults,
          badgeCriterion.threshold
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

function _verifyEveryCompetenceResultMasteryPercentageCriterion(partnerCompetenceResults, threshold) {
  return _.every(partnerCompetenceResults, (partnerCompetenceResult) =>
    partnerCompetenceResult.masteryPercentage >= threshold);
}

module.exports = {
  areBadgeCriteriaFulfilled,
};
