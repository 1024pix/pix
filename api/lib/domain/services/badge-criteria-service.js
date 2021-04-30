const _ = require('lodash');
const BadgeCriterion = require('../../../lib/domain/models/BadgeCriterion');
const logger = require('../../infrastructure/logger');

function areBadgeCriteriaFulfilled({ knowledgeElements, targetProfile, badge }) {
  const targetProfileSkillsIds = targetProfile.getSkillIds();
  const targetedKnowledgeElements = _removeUntargetedKnowledgeElements(knowledgeElements, targetProfileSkillsIds);

  const masteryPercentage = getMasteryPercentageForTargetProfile({ targetProfileSkillsIds, targetedKnowledgeElements });
  const partnerCompetenceResults = getMasteryPercentageForAllPartnerCompetences({ badge, targetProfileSkillsIds, targetedKnowledgeElements });

  return verifyCriteriaFulfilment({ masteryPercentage, partnerCompetenceResults, badge });
}

function getMasteryPercentageForTargetProfile({ targetProfileSkillsIds, targetedKnowledgeElements }) {
  const validatedSkillsCount = targetedKnowledgeElements.filter((targetedKnowledgeElement) => targetedKnowledgeElement.isValidated).length;
  const totalSkillsCount = targetProfileSkillsIds.length;
  return _computeMasteryPercentage({ totalSkillsCount, validatedSkillsCount });
}

function getMasteryPercentageForAllPartnerCompetences({ targetedKnowledgeElements, targetProfileSkillsIds, badge }) {
  if (_.isEmpty(badge.badgePartnerCompetences)) {
    return [];
  }

  const validTargetedPartnerCompetences = _keepValidTargetedPartnerCompetences(badge.badgePartnerCompetences, targetProfileSkillsIds);
  return _.map(validTargetedPartnerCompetences, (badgePartnerCompetence) => _getTestedCompetenceResults(badgePartnerCompetence, targetedKnowledgeElements));
}

function verifyCriteriaFulfilment({ masteryPercentage, partnerCompetenceResults, badge }) {
  if (badge.badgeCriteria.length === 0) {
    logger.warn(`No criteria for badge ${badge.id}`);
    return false;
  }
  return _.every(badge.badgeCriteria, (criterion) => {
    switch (criterion.scope) {
      case BadgeCriterion.SCOPES.CAMPAIGN_PARTICIPATION:
        return masteryPercentage >= criterion.threshold;

      case BadgeCriterion.SCOPES.EVERY_PARTNER_COMPETENCE:
        return _.every(partnerCompetenceResults, (partnerCompetenceResult) =>
          partnerCompetenceResult.masteryPercentage >= criterion.threshold);

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

function _verifySomePartnerCompetenceResultsMasteryPercentageCriterion(partnerCompetenceResults, threshold, criterionPartnerCompetenceIds) {
  const filteredPartnerCompetenceResults = _.filter(partnerCompetenceResults, (partnerCompetenceResult) => {
    return criterionPartnerCompetenceIds.includes(partnerCompetenceResult.id) && partnerCompetenceResult.masteryPercentage >= threshold;
  });

  return !_.isEmpty(filteredPartnerCompetenceResults);
}

function _removeUntargetedKnowledgeElements(knowledgeElements, targetProfileSkillsIds) {
  return _.filter(knowledgeElements, (ke) => targetProfileSkillsIds.some((skillId) => skillId === ke.skillId));
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
  if (totalSkillsCount === 0) {
    return 0;
  } else {
    return Math.round(validatedSkillsCount * 100 / totalSkillsCount);
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
  verifyCriteriaFulfilment,
  getMasteryPercentageForTargetProfile,
  getMasteryPercentageForAllPartnerCompetences,
};
