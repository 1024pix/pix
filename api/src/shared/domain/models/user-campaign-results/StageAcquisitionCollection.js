class StageAcquisitionCollection {
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

export { StageAcquisitionCollection };
