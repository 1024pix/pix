/**
 * This service compares available and acquired stages for a campaign participation.
 */
class StagesAndAcquiredStagesComparison {
  /**
   * @type {Stage[]}
   */
  #acquiredStages = [];

  /**
   * @type {number}
   */
  #totalNumberOfStages;

  /**
   * @param {Stage[]} availableStages
   * @param {StageAcquisition[]} stageAcquisitions
   */
  constructor(availableStages, stageAcquisitions) {
    this.#totalNumberOfStages = availableStages.length;
    this.#acquiredStages = availableStages
      .sort(this.#sortByLevelOrThreshold)
      .filter((availableStage) => stageAcquisitions.find(({ stageId }) => stageId === availableStage.id));
  }

  /**
   * @param {Stage} previousStage
   * @param {Stage} currentStage
   *
   * @returns {-1, 0, 1}
   */
  #sortByLevelOrThreshold(previousStage, currentStage) {
    if (currentStage.isFirstSkill) {
      return previousStage.isZeroStage ? -1 : 1;
    }
    return currentStage.level
      ? previousStage.level - currentStage.level
      : previousStage.threshold - currentStage.threshold;
  }

  /**
   * @returns {number}
   */
  get reachedStageNumber() {
    return this.#acquiredStages.length;
  }

  /**
   * @returns {number}
   */
  get totalNumberOfStages() {
    return this.#totalNumberOfStages;
  }

  /**
   * @returns {Stage}
   */
  get reachedStage() {
    return this.#acquiredStages[this.#acquiredStages.length - 1];
  }
}

/**
 * Compare stages and stages acquisitions to
 * build stages information for a campaign.
 *
 * @param {Stage[]} availableStages
 * @param {StageAcquisition[]} stageAcquisitions
 * @returns {{reachedStage: Stage, reachedStageNumber: number, totalNumberOfStages: number}}
 */
export const compare = (availableStages, stageAcquisitions) => {
  const stageComparison = new StagesAndAcquiredStagesComparison(availableStages, stageAcquisitions);

  return {
    reachedStageNumber: stageComparison.reachedStageNumber,
    totalNumberOfStages: stageComparison.totalNumberOfStages,
    reachedStage: stageComparison.reachedStage,
  };
};
