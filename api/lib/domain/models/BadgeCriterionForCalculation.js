import _ from 'lodash';

export class BadgeCriterionForCalculation {
  constructor({ threshold, skillIds }) {
    this.threshold = threshold;
    this.skillIds = skillIds;
  }

  getAcquisitionPercentage(knowledgeElements) {
    const knowledgeElementsInSkills = _removeKnowledgeElementsNotInSkills(knowledgeElements, this.skillIds);
    const validatedSkillsCount = knowledgeElementsInSkills.filter(
      (knowledgeElement) => knowledgeElement.isValidated,
    ).length;
    const totalSkillsCount = this.skillIds.length;
    const masteryPercentage = _computeMasteryPercentage(validatedSkillsCount, totalSkillsCount);

    const acquisitionPercentage = Math.round((masteryPercentage / this.threshold) * 100);

    return acquisitionPercentage > 100 ? 100 : acquisitionPercentage;
  }

  isFulfilled(knowledgeElements) {
    return this.getAcquisitionPercentage(knowledgeElements) === 100;
  }
}

function _removeKnowledgeElementsNotInSkills(knowledgeElements, skillIds) {
  return _.filter(knowledgeElements, (knowledgeElement) => skillIds.some((id) => id === knowledgeElement.skillId));
}

function _computeMasteryPercentage(validatedSkillsCount, totalSkillsCount) {
  if (totalSkillsCount === 0) return 0;
  return Math.round((validatedSkillsCount * 100) / totalSkillsCount);
}
