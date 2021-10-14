const _ = require('lodash');
const BadgeCriterion = require('../../../lib/domain/models/BadgeCriterion');
const logger = require('../../infrastructure/logger');

function areBadgeCriteriaFulfilled({ knowledgeElements, targetProfile, badge }) {
  const targetProfileSkillsIds = targetProfile.getSkillIds();
  const targetedKnowledgeElements = _removeUntargetedKnowledgeElements(knowledgeElements, targetProfileSkillsIds);

  const masteryPercentage = getMasteryPercentageForTargetProfile({ targetProfileSkillsIds, targetedKnowledgeElements });
  const skillSetResults = getMasteryPercentageForAllSkillSets({
    badge,
    targetProfileSkillsIds,
    targetedKnowledgeElements,
  });

  return verifyCriteriaFulfilment({ masteryPercentage, skillSetResults, badge });
}

function getMasteryPercentageForTargetProfile({ targetProfileSkillsIds, targetedKnowledgeElements }) {
  const validatedSkillsCount = targetedKnowledgeElements.filter(
    (targetedKnowledgeElement) => targetedKnowledgeElement.isValidated
  ).length;
  const totalSkillsCount = targetProfileSkillsIds.length;
  return _computeMasteryPercentage({ totalSkillsCount, validatedSkillsCount });
}

function getMasteryPercentageForAllSkillSets({ targetedKnowledgeElements, targetProfileSkillsIds, badge }) {
  if (_.isEmpty(badge.skillSets)) {
    return [];
  }

  const validTargetedSkillSets = _keepValidTargetedSkillSets(badge.skillSets, targetProfileSkillsIds);
  return _.map(validTargetedSkillSets, (skillSet) => _getTestedCompetenceResults(skillSet, targetedKnowledgeElements));
}

function verifyCriteriaFulfilment({ masteryPercentage, skillSetResults, badge }) {
  if (!badge.badgeCriteria.length) {
    logger.warn(`No criteria for badge ${badge.id}`);
    return false;
  }
  return _.every(badge.badgeCriteria, (criterion) => {
    if (criterion.scope === BadgeCriterion.SCOPES.CAMPAIGN_PARTICIPATION) {
      return masteryPercentage >= criterion.threshold;
    } else if (criterion.scope === BadgeCriterion.SCOPES.SKILL_SET) {
      return _verifyListOfSkillSetResultsMasteryPercentageCriterion({
        allSkillSetResults: skillSetResults,
        threshold: criterion.threshold,
        skillSetIds: criterion.skillSetIds,
      });
    } else {
      return false;
    }
  });
}

function _verifyListOfSkillSetResultsMasteryPercentageCriterion({ allSkillSetResults, threshold, skillSetIds }) {
  const filteredSkillSetResults = _.filter(allSkillSetResults, (skillSetResult) =>
    skillSetIds.includes(skillSetResult.id)
  );

  return _.every(filteredSkillSetResults, (skillSetResult) => skillSetResult.masteryPercentage >= threshold);
}

function _removeUntargetedKnowledgeElements(knowledgeElements, targetProfileSkillsIds) {
  return _.filter(knowledgeElements, (ke) => targetProfileSkillsIds.some((skillId) => skillId === ke.skillId));
}

function _keepValidTargetedSkillSets(skillSets, targetProfileSkillsIds) {
  const targetedCompetences = _removeUntargetedSkillIdsFromSkillSets(skillSets, targetProfileSkillsIds);
  return _removeSkillSetsWithoutAnyTargetedSkillsLeft(targetedCompetences);
}

function _removeUntargetedSkillIdsFromSkillSets(skillSets, targetProfileSkillsIds) {
  return _.map(skillSets, (skillSet) => {
    skillSet.skillIds = _.intersection(skillSet.skillIds, targetProfileSkillsIds);
    return skillSet;
  });
}

function _removeSkillSetsWithoutAnyTargetedSkillsLeft(skillSets) {
  return _.filter(skillSets, (skillSet) => !_.isEmpty(skillSet.skillIds));
}

function _computeMasteryPercentage({ totalSkillsCount, validatedSkillsCount }) {
  if (totalSkillsCount === 0) {
    return 0;
  } else {
    return Math.round((validatedSkillsCount * 100) / totalSkillsCount);
  }
}

function _getTestedCompetenceResults(skillSet, targetedKnowledgeElements) {
  const targetedKnowledgeElementsForCompetence = _.filter(targetedKnowledgeElements, (ke) =>
    _.includes(skillSet.skillIds, ke.skillId)
  );
  const validatedKnowledgeElementsForCompetence = _.filter(targetedKnowledgeElementsForCompetence, 'isValidated');

  const validatedSkillsCount = validatedKnowledgeElementsForCompetence.length;
  const totalSkillsCount = skillSet.skillIds.length;

  const masteryPercentage = _computeMasteryPercentage({ totalSkillsCount, validatedSkillsCount });

  return {
    id: skillSet.id,
    masteryPercentage,
  };
}

module.exports = {
  areBadgeCriteriaFulfilled,
  verifyCriteriaFulfilment,
  getMasteryPercentageForTargetProfile,
  getMasteryPercentageForAllSkillSets,
};
