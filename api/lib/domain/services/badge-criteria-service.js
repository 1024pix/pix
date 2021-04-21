const _ = require('lodash');
const BadgeCriterion = require('../../../lib/domain/models/BadgeCriterion');

function isBadgeAcquired({ knowledgeElements, targetProfile, badge }) {
  const { masteryPercentage, partnerCompetenceResults } =
    computeAllMasteryPercentages({ knowledgeElements, targetProfile, badge });

  return areBadgeCriteriaFulfilled({ masteryPercentage, partnerCompetenceResults, badge });
}

function computeAllMasteryPercentages({ knowledgeElements, targetProfile, badge }) {
  const targetProfileSkillsIds = targetProfile.getSkillIds();
  const targetedKnowledgeElements = _removeUntargetedKnowledgeElements(knowledgeElements, targetProfileSkillsIds);

  const partnerCompetenceResults = _computePartnerCompetenceResults(badge, targetProfileSkillsIds, targetedKnowledgeElements);

  const validatedSkillsCount = targetedKnowledgeElements.filter((targetedKnowledgeElement) => targetedKnowledgeElement.isValidated).length;
  const totalSkillsCount = targetProfileSkillsIds.length;
  const masteryPercentage = _computeMasteryPercentage({ totalSkillsCount, validatedSkillsCount });

  return { masteryPercentage, partnerCompetenceResults };
}

function areBadgeCriteriaFulfilled({ masteryPercentage, partnerCompetenceResults, badge }) {
  return _.every(badge.badgeCriteria, (criterion) => {
    switch (criterion.scope) {
      case BadgeCriterion.SCOPES.CAMPAIGN_PARTICIPATION:
        return masteryPercentage >= criterion.threshold;

      case BadgeCriterion.SCOPES.EVERY_PARTNER_COMPETENCE:
        return _verifyEveryPartnerCompetenceResultMasteryPercentageCriterion(
          partnerCompetenceResults,
          criterion.threshold,
        );

      case BadgeCriterion.SCOPES.SOME_PARTNER_COMPETENCES:
        return _verifySomePartnerCompetenceResultsMasteryPercentageCriterion(
          partnerCompetenceResults,
          criterion.threshold,
          criterion.partnerCompetenceIds,
        );
    }
    return false;
  });
}

function _verifyEveryPartnerCompetenceResultMasteryPercentageCriterion(partnerCompetenceResults, threshold) {
  return _.every(partnerCompetenceResults, (partnerCompetenceResult) =>
    partnerCompetenceResult.masteryPercentage >= threshold);
}

function _verifySomePartnerCompetenceResultsMasteryPercentageCriterion(partnerCompetenceResults, threshold, criterionPartnerCompetenceIds) {
  const filteredPartnerCompetenceResults = _.filter(partnerCompetenceResults, (partnerCompetenceResult) => {
    return criterionPartnerCompetenceIds.includes(partnerCompetenceResult.id) && partnerCompetenceResult.masteryPercentage >= threshold;
  });

  return !_.isEmpty(filteredPartnerCompetenceResults);
}

function _removeUntargetedKnowledgeElements(knowledgeElements, targetProfileSkillsIds) {
  return _.filter(knowledgeElements, (ke) => targetProfileSkillsIds.some((skillId) => skillId === ke.skillId));
}

function _computePartnerCompetenceResults(badge, targetProfileSkillsIds, targetedKnowledgeElements) {
  if (_.isEmpty(badge.badgePartnerCompetences)) {
    return [];
  }

  const validTargetedPartnerCompetences = _keepValidTargetedPartnerCompetences(badge.badgePartnerCompetences, targetProfileSkillsIds);
  return _.map(validTargetedPartnerCompetences, (badgePartnerCompetence) => _getTestedCompetenceResults(badgePartnerCompetence, targetedKnowledgeElements));
}

function _keepValidTargetedPartnerCompetences(badgePartnerCompetences, targetProfileSkillsIds) {
  const targetedCompetences = _removeUntargetedSkillIdsFromPartnerCompetences(badgePartnerCompetences, targetProfileSkillsIds);
  return _removePartnerCompetencesWithoutAnyTargetedSkillsLeft(targetedCompetences);
}

function _removeUntargetedSkillIdsFromPartnerCompetences(badgePartnerCompetences, targetProfileSkillsIds) {
  return _.map(badgePartnerCompetences, (badgePartnerCompetence) => {
    badgePartnerCompetence.skillIds = _.intersection(badgePartnerCompetence.skillIds, targetProfileSkillsIds);
    return badgePartnerCompetence;
  });
}

function _removePartnerCompetencesWithoutAnyTargetedSkillsLeft(badgePartnerCompetences) {
  return _.filter(badgePartnerCompetences, (badgePartnerCompetence) => !_.isEmpty(badgePartnerCompetence.skillIds));
}

function _computeMasteryPercentage({ totalSkillsCount, validatedSkillsCount }) {
  if (totalSkillsCount !== 0) {
    return Math.round(validatedSkillsCount * 100 / totalSkillsCount);
  } else {
    return 0;
  }
}

function _getTestedCompetenceResults(badgePartnerCompetence, targetedKnowledgeElements) {
  const targetedKnowledgeElementsForCompetence = _.filter(targetedKnowledgeElements, (ke) => _.includes(badgePartnerCompetence.skillIds, ke.skillId));
  const validatedKnowledgeElementsForCompetence = _.filter(targetedKnowledgeElementsForCompetence, 'isValidated');

  const validatedSkillsCount = validatedKnowledgeElementsForCompetence.length;
  const totalSkillsCount = badgePartnerCompetence.skillIds.length;

  const masteryPercentage = _computeMasteryPercentage({ totalSkillsCount, validatedSkillsCount });

  return {
    id: badgePartnerCompetence.id,
    masteryPercentage,
  };
}

module.exports = {
  areBadgeCriteriaFulfilled,
  isBadgeAcquired,
  computeAllMasteryPercentages,
};
