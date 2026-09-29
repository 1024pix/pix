import { getMasteryPercentage } from '../../../evaluation/domain/services/get-mastery-percentage-service.js';

export class BadgeCriterionForCalculation {
  constructor({ threshold, skillIds }) {
    this.threshold = threshold;
    this.skillIds = skillIds;
  }

  getAcquisitionPercentage(knowledgeState) {
    const masteryPercentage = getMasteryPercentage(knowledgeState, this.skillIds, false);
    const acquisitionPercentage = Math.round((masteryPercentage / this.threshold) * 100);
    return acquisitionPercentage > 100 ? 100 : acquisitionPercentage;
  }

  isFulfilled(knowledgeState) {
    return this.getAcquisitionPercentage(knowledgeState) === 100;
  }
}
