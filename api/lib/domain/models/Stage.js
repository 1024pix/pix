class Stage {
  /**
   * @param {number} id
   * @param {string} title
   * @param {string} message
   * @param {number|undefined} threshold
   * @param {number|undefined} level
   * @param {string} prescriberTitle
   * @param {string} prescriberDescription
   * @param {number} targetProfileId
   * @param {boolean} isFirstSkill
   */
  constructor({
    id,
    isFirstSkill,
    level,
    message,
    prescriberDescription,
    prescriberTitle,
    targetProfileId,
    threshold,
    title,
  } = {}) {
    this.id = id;
    this.isFirstSkill = isFirstSkill;
    this.level = level;
    this.message = message;
    this.prescriberDescription = prescriberDescription;
    this.prescriberTitle = prescriberTitle;
    this.targetProfileId = targetProfileId;
    this.threshold = threshold;
    this.title = title;
  }

  /**
   * @returns {boolean}
   */
  get isZeroStage() {
    return this.level === 0 || this.threshold === 0;
  }

  /**
   * Stage can be defined by stage or threshold.
   *
   * @returns {boolean}
   */
  get isLevelStage() {
    return Boolean(this.level);
  }

  /**
   * Used to convert level into threshold.
   *
   * @param {number} value
   */
  setThreshold(value) {
    this.level = undefined;
    this.threshold = value;
  }
}

export { Stage };
